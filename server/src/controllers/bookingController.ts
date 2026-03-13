import { Request, Response } from "express";
import crypto from "crypto";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { getIO } from "../sockets/socket.js";
import { getDay } from "date-fns";
import { getPaginationParams } from "../utils/pagination.js";
import { sendEmail } from "../utils/sendEmail.js";
import { bookingConfirmationTemplate } from "../templates/bookingConfirmationEmail.js";
import { bookingCancellationTemplate } from "../templates/bookingCancellationEmail.js";
import { restaurantBookingNotificationTemplate } from "../templates/restaurantBookingNotification.js";
import { stripeService } from "../services/stripeService.js";

// Validate that the booking date falls within the restaurant's opening hours
function validateBookingTime(restaurant: any, bookingDate: string): boolean {
  const date = new Date(bookingDate);

  // Use Intl.DateTimeFormat to get French local time parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  const dayName = partMap.weekday.toLowerCase();
  const hour = parseInt(partMap.hour);
  const minute = parseInt(partMap.minute);

  const dayInfo = restaurant.openingHours?.get ? restaurant.openingHours.get(dayName) : restaurant.openingHours?.[dayName];
  if (!dayInfo) return false;
  if (dayInfo.isClosed) return false;

  const timeMinutes = hour * 60 + minute;
  for (const period of dayInfo.periods) {
    const [openH, openM] = period.open.split(":").map(Number);
    const [closeH, closeM] = period.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    if (timeMinutes >= openMinutes && timeMinutes <= closeMinutes) {
      return true;
    }
  }
  return false;
}

/**
 * @function createSetupIntent
 * @description Creates a Stripe SetupIntent for bank imprints before finalizing the booking.
 */
export const createSetupIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, email, name } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    if (!restaurant.isBankImprintEnabled) {
      res.status(400).json({ error: "L'empreinte bancaire n'est pas activée pour ce restaurant." });
      return;
    }

    // Attempt to find or create customer
    let stripeCustomer;
    try {
      // Create a customer just for this imprint (we might reuse via user profile later)
      stripeCustomer = await stripeService.createCustomer(email || "", name || "Client Couverto");
    } catch (err) {
      console.error("Failed to create Stripe Customer", err);
      res.status(500).json({ error: "Erreur lors de la création du client Stripe" });
      return;
    }

    const setupIntent = await stripeService.createSetupIntent(stripeCustomer.id, {
      restaurantId: restaurant._id.toString(),
      type: "bank_imprint",
    });

    res.status(200).json({
      clientSecret: setupIntent.client_secret,
      customerId: stripeCustomer.id,
    });
  } catch (error) {
    console.error("Error creating SetupIntent:", error);
    res.status(500).json({ error: "Erreur lors de l'initialisation du paiement sécurisé" });
  }
};

/**
 * @function createBooking
 * @description Creates a new booking.
 * Handles both authenticated and guest users.
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurant, bookingDate, guests, customer, notes, stripeSetupIntentId, bankImprintAmount, stripeCustomerId } = req.body;
    const userId = req.userId; // Middleware should populate this if token present

    // Validate restaurant existence
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    if (restaurantExists.isBankImprintEnabled && !stripeSetupIntentId) {
      res.status(400).json({ error: "Une empreinte bancaire est requise pour réserver dans cet établissement." });
      return;
    }

    // Check exceptional closures
    if (restaurantExists.exceptionalClosures && restaurantExists.exceptionalClosures.length > 0) {
      const isExceptionallyClosed = restaurantExists.exceptionalClosures.some((closure: any) => {
        const start = new Date(closure.startDate);
        const end = new Date(closure.endDate);

        const bDate = new Date(bookingDate);
        const bStr = bDate.toISOString().split("T")[0];
        const sStr = start.toISOString().split("T")[0];
        const eStr = end.toISOString().split("T")[0];

        return bStr >= sStr && bStr <= eStr;
      });

      if (isExceptionallyClosed) {
        res.status(400).json({ error: "Le restaurant est exceptionnellement fermé ce jour-là." });
        return;
      }
    }

    // Validate opening hours
    const isValidTime = validateBookingTime(restaurantExists, bookingDate);
    if (!isValidTime) {
      res.status(400).json({ error: "Le restaurant est fermé à cet horaire." });
      return;
    }

    // Prepare booking data
    const bookingData: any = {
      restaurant,
      bookingDate,
      guests,
      customer,
      notes,
      user: userId || null,
      stripeSetupIntentId: stripeSetupIntentId || undefined,
      stripeCustomerId: stripeCustomerId || undefined,
      bankImprintAmount: bankImprintAmount || undefined,
      bankImprintStatus: stripeSetupIntentId ? "secured" : "none",
      cancellationCode: crypto.randomBytes(16).toString("hex"),
    };

    // If authenticated, we can optionally override customer info with user profile if not provided,
    // but the frontend usually sends the form data. We'll trust the body.
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { phone: customer.phone });
      } catch (userUpdateErr) {
        console.error("Failed to update user phone during booking", userUpdateErr);
      }
    }

    // Check for auto-confirmation based on capacity
    // Default status is PENDING
    // logic: if capacity is set (>0) and (current bookings count + new guests) <= capacity, then CONFIRMED
    // If capacity exceeded, REJECT the booking

    if (restaurantExists.capacity && restaurantExists.capacity > 0) {
      const bookingTime = new Date(bookingDate).getTime();
      // Assume 2 hours meal duration for overlap check
      // Check bookings that overlap with [bookingTime, bookingTime + 2h]
      // Valid overlap: existing.start < new.end && existing.end > new.start
      // For simplicity, we check bookings within +/- 2 hours range

      const twoHours = 2 * 60 * 60 * 1000;
      const startTime = new Date(bookingTime - twoHours);
      const endTime = new Date(bookingTime + twoHours);

      const existingBookings = await Booking.find({
        restaurant: restaurant,
        bookingDate: { $gte: startTime, $lte: endTime },
        status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
      });

      // Filter deeper if needed for precise overlap, but 2h window query is a decent approximation
      // Let's do precise overlap check if we consider fixed 2h slots logic implicit
      // New booking interval: [T, T+2h]
      // Existing booking interval: [Tb, Tb+2h]
      // Overlap if: Tb < T+2h && Tb+2h > T

      const newStart = bookingTime;
      const newEnd = bookingTime + twoHours;

      let currentHeadCount = 0;

      for (const booking of existingBookings) {
        const bStart = new Date(booking.bookingDate).getTime();
        const bEnd = bStart + twoHours;

        if (bStart < newEnd && bEnd > newStart) {
          currentHeadCount += booking.guests;
        }
      }

      const availableSpots = restaurantExists.capacity - currentHeadCount;

      // REJECT if not enough capacity
      if (currentHeadCount + Number(guests) > restaurantExists.capacity) {
        res.status(400).json({
          error:
            availableSpots <= 0
              ? "Ce créneau est complet. Veuillez choisir un autre horaire."
              : `Il ne reste que ${availableSpots} place(s) disponible(s) pour ce créneau.`,
          availableSpots,
          isFull: availableSpots <= 0,
        });
        return;
      }

      // Auto-confirm if within capacity
      bookingData.status = bookingStatus.CONFIRMED;

      // Extract available pages to check for tablePlan feature
      const availablePages = new Set<string>();

      // Populate is not needed directly here if we just do a separate lookup, but restaurantExists isn't populated with plan.
      // Let's do a quick lookup if there's a plan
      if (restaurantExists.plan) {
        const { Plan } = await import("../models/planModel.js");
        const plan = await Plan.findById(restaurantExists.plan).populate("features");
        if (plan && plan.features) {
          (plan as any).features.forEach((f: any) => {
            if (f.active && f.associatedPages && Array.isArray(f.associatedPages)) {
              f.associatedPages.forEach((p: string) => availablePages.add(p));
            }
          });
        }
      }

      if (restaurantExists.features && restaurantExists.features.length > 0) {
        const { Feature } = await import("../models/featureModel.js");
        const extraFeatures = await Feature.find({ name: { $in: restaurantExists.features }, active: true });
        extraFeatures.forEach((f) => {
          if (f.associatedPages && Array.isArray(f.associatedPages)) {
            f.associatedPages.forEach((p: string) => availablePages.add(p));
          }
        });
      }

      const hasTablePlanFeature = availablePages.has("tablePlan");

      // Table Auto-Assignment Logic
      if (hasTablePlanFeature && restaurantExists.zones && restaurantExists.zones.length > 0) {
        // Get all tables from all zones
        const allTables: any[] = [];
        restaurantExists.zones.forEach((zone: any, index: number) => {
          if (zone.tables) {
            zone.tables.forEach((table: any) => {
              allTables.push({
                id: table.id,
                seats: table.seats,
                label: table.label,
                zoneId: zone.id,
                zoneIndex: index,
              });
            });
          }
        });

        // Find tables occupied by existingBookings within the overlap
        const occupiedTableIds = new Set();
        for (const booking of existingBookings) {
          if (booking.tableId) {
            const bStart = new Date(booking.bookingDate).getTime();
            const bEnd = bStart + twoHours;
            if (bStart < newEnd && bEnd > newStart) {
              occupiedTableIds.add(booking.tableId);
            }
          }
        }

        // Find available tables that fit the guests
        const availableFittingTables = allTables
          .filter((table) => !occupiedTableIds.has(table.id) && table.seats >= Number(guests))
          .sort((a, b) => {
            // Prioritize zones order (fill 1st room first)
            if (a.zoneIndex !== b.zoneIndex) {
              return a.zoneIndex - b.zoneIndex;
            }
            // Then capacity fit (smallest fitting first)
            return a.seats - b.seats;
          });

        if (availableFittingTables.length > 0) {
          bookingData.tableId = availableFittingTables[0].id;
          bookingData.zoneId = availableFittingTables[0].zoneId;
        }
      }
    }

    const newBooking = await Booking.create(bookingData);

    // Emit real-time event to restaurant room
    try {
      // Need to populate customer name if it's from user profile, but created booking has it in customer object
      // If we used userId, we might want to populate. But here we have customer object in body.
      // But let's check what socket needs. The frontend usage will need consistent data.
      // The booking object created has customer data.
      getIO().to(`restaurant_${restaurant}`).emit("newBooking", newBooking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    // Send confirmation email
    try {
      if (customer.email) {
        const dateStr = new Date(bookingDate).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = new Date(bookingDate).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const statusSubject = newBooking.status === bookingStatus.CONFIRMED ? "Confirmée" : "En attente";
        const isConfirmed = newBooking.status === bookingStatus.CONFIRMED;

        const htmlContent = bookingConfirmationTemplate({
          customerName: customer.name,
          restaurantName: restaurantExists.name,
          date: dateStr,
          time: timeStr,
          guests: guests,
          status: statusSubject,
          isConfirmed: isConfirmed,
          address: restaurantExists.adress, // Assuming 'adress' property exists
          cancellationCode: newBooking.cancellationCode,
        });

        await sendEmail({
          email: customer.email,
          subject: `Réservation ${statusSubject} - ${restaurantExists.name}`,
          message: htmlContent,
        });
      }
    } catch (mailError) {
      console.error("Booking confirmation email failed", mailError);
    }

    // Notify Restaurant (if email exists and setting is enabled)
    if (restaurantExists.email && restaurantExists.sendBookingEmail) {
      try {
        const dateStr = new Date(bookingDate).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = new Date(bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        await sendEmail({
          email: restaurantExists.email,
          subject: `Nouvelle réservation - ${customer.name}`,
          message: restaurantBookingNotificationTemplate({
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            date: dateStr,
            time: timeStr,
            guests: guests,
            notes: notes,
            restaurantName: restaurantExists.name,
          }),
        });
      } catch (restaurantMailError) {
        console.error("Restaurant notification email failed", restaurantMailError);
      }
    }

    createLog({
      message: `Booking created for restaurant ${restaurant} by ${customer.name}`,
      userId: userId || undefined,
      level: logLevels.INFO,
    });

    res.status(201).json({ booking: newBooking, message: "Réservation créée" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getMyBookings
 * @description Retrieves bookings for the authenticated user with pagination and filters.
 * @query page - Page number (0-indexed)
 * @query size - Page size (default 10)
 * @query status - Filter by booking status (PENDING, CONFIRMED, CANCELLED)
 * @query search - Search by restaurant name
 */
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }

    const { page, size } = getPaginationParams(req);
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query
    const query: any = { user: userId };

    // Filter by status if provided
    if (status && Object.values(bookingStatus).includes(status as bookingStatus)) {
      query.status = status;
    }

    // Get bookings with population
    let bookingsQuery = Booking.find(query)
      .populate("restaurant", "name slug adress city coverImage phone website openingHours")
      .sort({ bookingDate: -1 });

    // If search is provided, we need to filter after population
    let bookings = await bookingsQuery;
    let totalCount = bookings.length;

    // Filter by restaurant name if search is provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      bookings = bookings.filter((booking: any) => booking.restaurant?.name?.toLowerCase().includes(searchLower));
      totalCount = bookings.length;
    }

    // Apply pagination
    const skip = page * size;
    const paginatedBookings = bookings.slice(skip, skip + size);

    res.status(200).json({
      bookings: paginatedBookings,
      count: totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getBookingById
 * @description Retrieves a single booking by ID.
 * Ensures the user owns the booking or is an admin (admin check logic might need middleware or detailed check).
 * For now, simple owner check.
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    // @ts-ignore
    const userEmail = req.user?.email?.toLowerCase();

    const booking = await Booking.findById(id).populate("restaurant");

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Security check: user must own the booking (by user ID or email match)
    const bookingEmail = booking.customer?.email?.toLowerCase();
    const isUserMatch = booking.user && booking.user.toString() === userId?.toString();
    const isEmailMatch = userEmail && bookingEmail && userEmail === bookingEmail;

    if (!isUserMatch && !isEmailMatch) {
      res.status(403).json({ error: "Accès interdit" });
      return;
    }

    res.status(200).json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBooking
 * @description Updates booking details (date, guests, notes).
 * Only allows modification if status is PENDING or CONFIRMED (not CANCELLED).
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bookingDate, guests, notes } = req.body;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Check if booking date is in the past
    if (new Date(booking.bookingDate) < new Date()) {
      res.status(400).json({ error: "Impossible de modifier une réservation passée" });
      return;
    }

    if (booking.status === bookingStatus.CANCELLED) {
      res.status(400).json({ error: "Impossible de modifier une réservation annulée" });
      return;
    }

    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.guests = guests || booking.guests;
    booking.notes = notes !== undefined ? notes : booking.notes;

    // Validate new time if date changed
    // Validate new time if date changed
    if (bookingDate) {
      const restaurantDoc = await Restaurant.findById(booking.restaurant);
      if (restaurantDoc) {
        const isValidTime = validateBookingTime(restaurantDoc, bookingDate);
        if (!isValidTime) {
          res.status(400).json({ error: "Le restaurant est fermé à cette heure modification impossible" });
          return;
        }
      }
    }

    await booking.save();

    // Fetch restaurant for notifications
    const restaurantDoc = await Restaurant.findById(booking.restaurant);

    // Emit real-time event
    try {
      getIO().to(`restaurant_${booking.restaurant}`).emit("updateBooking", booking);
      getIO().to(`restaurant_${booking.restaurant}`).emit("newBooking", booking); // Also emit newBooking to trigger stats refresh or sound if specific listeners exist
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    // Email Notifications
    try {
      if (restaurantDoc) {
        const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        // Notify Customer
        if (booking.customer?.email) {
          await sendEmail({
            email: booking.customer.email,
            subject: `Modification de réservation - ${restaurantDoc.name}`,
            message: bookingConfirmationTemplate({
              customerName: booking.customer.name,
              restaurantName: restaurantDoc.name,
              date: dateStr,
              time: timeStr,
              guests: booking.guests,
              status: "Modifiée",
              isConfirmed: booking.status === bookingStatus.CONFIRMED,
              address: restaurantDoc.adress,
            }),
          });
        }

        // Notify Restaurant (if email exists and setting is enabled)
        if (restaurantDoc.email && restaurantDoc.sendBookingEmail) {
          await sendEmail({
            email: restaurantDoc.email,
            subject: `[MODIFICATION] Réservation - ${booking.customer.name}`,
            message: `
               <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                 <h2 style="color: #333;">Modification de réservation</h2>
                 <p>La réservation de <strong>${booking.customer.name}</strong> a été modifiée.</p>
                 <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>Nouvelle date :</strong> ${dateStr} à ${timeStr}</p>
                   <p style="margin: 5px 0;"><strong>Couverts :</strong> ${booking.guests} personnes</p>
                   ${notes ? `<p style="margin: 5px 0;"><strong>Note :</strong> ${notes}</p>` : ""}
                 </div>
                 <p style="color: #666; font-size: 14px;">Connectez-vous à votre tableau de bord pour plus de détails.</p>
               </div>
             `,
          });
        }
      }
    } catch (e) {
      console.error("Email notification failed", e);
    }

    createLog({
      message: `Booking ${id} updated`,
      userId: userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ booking, message: "Réservation mise à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelBooking
 * @description Cancels a booking.
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    booking.status = bookingStatus.CANCELLED;
    await booking.save();

    // Emit real-time event to restaurant room
    try {
      getIO().to(`restaurant_${booking.restaurant}`).emit("updateBooking", booking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    createLog({
      message: `Booking ${id} cancelled by user`,
      userId: userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Réservation annulée" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelBookingByToken
 * @description Cancels a booking using a unique cancellation token (for guests).
 */
export const cancelBookingByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const booking = await Booking.findOne({ cancellationCode: token });

    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable ou lien invalide" });
      return;
    }

    if (booking.status === bookingStatus.CANCELLED) {
      res.status(400).json({ error: "Cette réservation est déjà annulée" });
      return;
    }

    // Optional: check if booking is in the past
    if (new Date(booking.bookingDate) < new Date()) {
      res.status(400).json({ error: "Impossible d'annuler une réservation passée" });
      return;
    }

    booking.status = bookingStatus.CANCELLED;

    // Handle bank imprint release if secured
    if (booking.bankImprintStatus === "secured" && booking.stripeSetupIntentId) {
      try {
        await stripeService.cancelSetupIntent(booking.stripeSetupIntentId);
        booking.bankImprintStatus = "released";
      } catch (stripeErr) {
        console.error("Failed to release bank imprint during guest cancellation", stripeErr);
      }
    }

    await booking.save();

    // Fetch restaurant for notifications
    const restaurantDoc = await Restaurant.findById(booking.restaurant);

    // Emit real-time event
    try {
      getIO().to(`restaurant_${booking.restaurant}`).emit("updateBooking", booking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    // Email Notifications
    try {
      if (restaurantDoc && booking.customer?.email) {
        const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        // Notify Customer
        await sendEmail({
          email: booking.customer.email,
          subject: `Réservation Annulée - ${restaurantDoc.name}`,
          message: bookingCancellationTemplate({
            customerName: booking.customer.name,
            restaurantName: restaurantDoc.name,
            date: dateStr,
            time: timeStr,
            reason: "Annulation par le client via le mail de confirmation",
            address: restaurantDoc.adress,
            phone: restaurantDoc.phone,
            website: restaurantDoc.website,
          }),
        });

        // Notify Restaurant (if email exists and setting is enabled)
        if (restaurantDoc.email && restaurantDoc.sendBookingEmail) {
          await sendEmail({
            email: restaurantDoc.email,
            subject: `[ANNULATION] Réservation - ${booking.customer.name}`,
            message: `
               <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                 <h2 style="color: #d32f2f;">Réservation Annulée</h2>
                 <p>La réservation de <strong>${booking.customer.name}</strong> a été annulée par le client.</p>
                 <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>Date :</strong> ${dateStr} à ${timeStr}</p>
                   <p style="margin: 5px 0;"><strong>Nombre de personnes :</strong> ${booking.guests}</p>
                 </div>
                 <p style="color: #666; font-size: 14px;">Cette table est désormais de nouveau disponible.</p>
               </div>
             `,
          });
        }
      }
    } catch (e) {
      console.error("Email notification failed", e);
    }

    createLog({
      message: `Booking ${booking._id} cancelled by guest via token`,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Réservation annulée avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function dismissBooking
 * @description Dismisses a booking from the restaurant dashboard (archives it visually).
 */
export const dismissBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: bookingId, restaurant: id });

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    booking.isDismissedByRestaurant = true;
    await booking.save();

    createLog({
      message: `Booking ${bookingId} dismissed from dashboard widget`,
      userId: userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Réservation masquée", booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createManualBooking
 * @description Allows admin/restaurant staff to create a manual booking.
 */
export const createManualBooking = async (req: Request, res: Response): Promise<void> => {
  // This is essentially same as createBooking but might enforce 'CONFIRMED' status immediately
  // and might be called by a different role.
  try {
    const { restaurant, bookingDate, guests, customer, notes } = req.body;

    // Check restaurant existence and capacity
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Capacity check for manual bookings too
    if (restaurantExists.capacity && restaurantExists.capacity > 0) {
      const bookingTime = new Date(bookingDate).getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      const startTime = new Date(bookingTime - twoHours);
      const endTime = new Date(bookingTime + twoHours);

      const existingBookings = await Booking.find({
        restaurant: restaurant,
        bookingDate: { $gte: startTime, $lte: endTime },
        status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
      });

      const newStart = bookingTime;
      const newEnd = bookingTime + twoHours;
      let currentHeadCount = 0;

      for (const booking of existingBookings) {
        const bStart = new Date(booking.bookingDate).getTime();
        const bEnd = bStart + twoHours;
        if (bStart < newEnd && bEnd > newStart) {
          currentHeadCount += booking.guests;
        }
      }

      const availableSpots = restaurantExists.capacity - currentHeadCount;

      if (currentHeadCount + Number(guests) > restaurantExists.capacity) {
        res.status(400).json({
          error:
            availableSpots <= 0 ? "Ce créneau est complet." : `Il ne reste que ${availableSpots} place(s) disponible(s) pour ce créneau.`,
          availableSpots,
          isFull: availableSpots <= 0,
        });
        return;
      }
    }

    const bookingData: any = {
      restaurant,
      bookingDate,
      guests,
      customer,
      notes,
      status: bookingStatus.CONFIRMED, // Manual bookings are usually direct entry
      user: null, // Usually manual bookings are not linked to a web user account unless specified
    };

    // Table Auto-Assignment Logic for Manual Bookings
    if (restaurantExists.zones && restaurantExists.zones.length > 0) {
      const bookingTime = new Date(bookingDate).getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      const newStart = bookingTime;
      const newEnd = bookingTime + twoHours;

      // Get all tables from all zones
      const allTables: any[] = [];
      restaurantExists.zones.forEach((zone: any, index: number) => {
        if (zone.tables) {
          zone.tables.forEach((table: any) => {
            allTables.push({
              id: table.id,
              seats: table.seats,
              label: table.label,
              zoneId: zone.id,
              zoneIndex: index,
            });
          });
        }
      });

      // Find occupied tables
      const startTime = new Date(bookingTime - twoHours);
      const endTime = new Date(bookingTime + twoHours);
      const existingBookings = await Booking.find({
        restaurant: restaurant,
        bookingDate: { $gte: startTime, $lte: endTime },
        status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
      });

      const occupiedTableIds = new Set();
      for (const booking of existingBookings) {
        if (booking.tableId) {
          const bStart = new Date(booking.bookingDate).getTime();
          const bEnd = bStart + twoHours;
          if (bStart < newEnd && bEnd > newStart) {
            occupiedTableIds.add(booking.tableId);
          }
        }
      }

      // Find available tables that fit the guests
      const availableFittingTables = allTables
        .filter((table) => !occupiedTableIds.has(table.id) && table.seats >= Number(guests))
        .sort((a, b) => {
          if (a.zoneIndex !== b.zoneIndex) {
            return a.zoneIndex - b.zoneIndex;
          }
          return a.seats - b.seats;
        });

      if (availableFittingTables.length > 0) {
        bookingData.tableId = availableFittingTables[0].id;
        bookingData.zoneId = availableFittingTables[0].zoneId;
      }
    }

    const newBooking = await Booking.create(bookingData);

    createLog({
      message: `Manual booking created for restaurant ${restaurant}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ booking: newBooking, message: "Réservation créée" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantBookings
 * @description Retrieves all bookings for a restaurant (for collaborators).
 * Sorted so that upcoming bookings appear first (ascending), then past bookings (descending).
 */
export const getRestaurantBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, size } = getPaginationParams(req, 20);
    const status = req.query.status as string;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    const mongoose = await import("mongoose");
    const restaurantId = mongoose.Types.ObjectId.createFromHexString(id);
    const now = new Date();

    const query: any = { restaurant: restaurantId };

    // Filter by status
    if (status && Object.values(bookingStatus).includes(status as bookingStatus)) {
      query.status = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.bookingDate = {};
      if (dateFrom) query.bookingDate.$gte = new Date(dateFrom);
      if (dateTo) query.bookingDate.$lte = new Date(dateTo);
    }

    // Search by customer name or phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ "customer.name": searchRegex }, { "customer.phone": searchRegex }, { "customer.email": searchRegex }];
    }

    // Aggregation: future bookings first (ascending), then past bookings (descending)
    const bookings = await Booking.aggregate([
      { $match: query },
      {
        $addFields: {
          _isFuture: { $gte: ["$bookingDate", now] },
          _sortKey: {
            $cond: {
              if: { $gte: ["$bookingDate", now] },
              then: { $toLong: "$bookingDate" },
              else: { $multiply: [{ $toLong: "$bookingDate" }, -1] },
            },
          },
        },
      },
      { $sort: { _isFuture: -1, _sortKey: 1 } },
      { $skip: page * size },
      { $limit: size },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { name: 1, forename: 1, email: 1, avatar: 1 } }],
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { _isFuture: 0, _sortKey: 0 } },
    ]);

    const count = await Booking.countDocuments(query);

    // Enrich with table labels
    const restaurantDoc = await Restaurant.findById(id).select("zones");
    const bookingsWithLabels = bookings.map((b: any) => {
      if (b.tableId && restaurantDoc?.zones) {
        for (const zone of restaurantDoc.zones) {
          const table = zone.tables.find((t: any) => t.id === b.tableId);
          if (table) {
            b.tableLabel = table.label;
            b.zoneName = zone.name;
            break;
          }
        }
      }
      return b;
    });

    res.status(200).json({
      bookings: bookingsWithLabels,
      count,
      page,
      size,
      totalPages: Math.ceil(count / size),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, size } = getPaginationParams(req, 20);
    const search = req.query.search as string;

    const mongoose = await import("mongoose");
    const restaurantId = mongoose.Types.ObjectId.createFromHexString(id);

    const matchStage: any = {
      restaurant: restaurantId,
      status: { $ne: "CANCELLED" },
    };

    // Grouping by user if available, otherwise by phone
    const clientsAggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ["$user", "$customer.phone"] },
          userId: { $first: "$user" },
          name: { $first: "$customer.name" },
          email: { $first: "$customer.email" },
          phone: { $first: "$customer.phone" },
          totalBookings: { $sum: 1 },
          totalGuests: { $sum: "$guests" },
          lastVisit: { $max: "$bookingDate" },
          firstVisit: { $min: "$bookingDate" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          phone: 1,
          totalBookings: 1,
          totalGuests: 1,
          lastVisit: 1,
          firstVisit: 1,
          name: { $ifNull: ["$userDetails.fullname", "$name"] },
          email: { $ifNull: ["$userDetails.email", "$email"] },
          avatar: "$userDetails.avatar",
          isRegistered: { $cond: [{ $ifNull: ["$userId", false] }, true, false] },
        },
      },
      // Search filter after projection/join
      ...(search && search.trim()
        ? [
            {
              $match: {
                $or: [
                  { name: new RegExp(search.trim(), "i") },
                  { phone: new RegExp(search.trim(), "i") },
                  { email: new RegExp(search.trim(), "i") },
                ],
              },
            },
          ]
        : []),
      { $sort: { lastVisit: -1 } },
      { $skip: page * size },
      { $limit: size },
    ]);

    // Count unique clients
    const countAggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ["$user", "$customer.phone"] },
        },
      },
      { $count: "total" },
    ]);

    res.status(200).json({
      clients: clientsAggregation,
      count: countAggregation[0]?.total || 0,
      page,
      size,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBookingStatus
 * @description Updates a booking status (for restaurant collaborators).
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(bookingStatus).includes(status)) {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, restaurant: id });

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    booking.status = status;
    await booking.save();

    // Send Cancellation Email if status is CANCELLED (Restaurant initiated)
    if (status === bookingStatus.CANCELLED) {
      try {
        const restaurantDoc = await Restaurant.findById(id).select("name adress phone website");
        const customerEmail = booking.customer?.email;

        if (customerEmail && restaurantDoc) {
          const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR");
          const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

          const htmlContent = bookingCancellationTemplate({
            customerName: booking.customer.name,
            restaurantName: restaurantDoc.name,
            date: dateStr,
            time: timeStr,
            reason: reason,
            address: restaurantDoc.adress,
            phone: restaurantDoc.phone,
            website: restaurantDoc.website,
          });

          await sendEmail({
            email: customerEmail,
            subject: `Réservation Annulée - ${restaurantDoc.name}`,
            message: htmlContent,
          });
        }
      } catch (mailError) {
        console.error("Booking cancellation email failed", mailError);
      }
    } else if (status === bookingStatus.CONFIRMED) {
      // Send Confirmation Email if status is CONFIRMED (Restaurant manually confirmed)
      try {
        const restaurantDoc = await Restaurant.findById(id).select("name adress phone website");
        const customerEmail = booking.customer?.email;

        if (customerEmail && restaurantDoc) {
          const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

          const htmlContent = bookingConfirmationTemplate({
            customerName: booking.customer.name,
            restaurantName: restaurantDoc.name,
            date: dateStr,
            time: timeStr,
            guests: booking.guests,
            status: "Confirmée",
            isConfirmed: true,
            address: restaurantDoc.adress,
            phone: restaurantDoc.phone,
            website: restaurantDoc.website,
          });

          await sendEmail({
            email: customerEmail,
            subject: `Réservation Confirmée - ${restaurantDoc.name}`,
            message: htmlContent,
          });
        }
      } catch (mailError) {
        console.error("Booking confirmation email failed", mailError);
      }
    }

    // Emit real-time event to restaurant room
    try {
      getIO().to(`restaurant_${id}`).emit("updateBooking", booking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    createLog({
      message: `Booking status updated to ${status}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ booking, message: "Réservation mise à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBookingTable
 * @description Updates the assigned table for a booking (for restaurant collaborators).
 */
export const updateBookingTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params;
    const { tableId, zoneId } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, restaurant: id });

    if (!booking) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    booking.tableId = tableId;
    booking.zoneId = zoneId || booking.zoneId;
    await booking.save();

    // Emit real-time event
    try {
      getIO().to(`restaurant_${id}`).emit("updateBooking", booking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    createLog({
      message: `Booking ${bookingId} table updated to ${tableId}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ booking, message: "Table mise à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getAdminBookings
 * @description Retrieves all bookings for the admin dashboard with pagination and search.
 */
export const getAdminBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, size } = getPaginationParams(req, 20);
    const search = req.query.search as string;
    const status = req.query.status as string;

    const query: any = {};

    if (status && Object.values(bookingStatus).includes(status as bookingStatus)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ "customer.name": searchRegex }, { "customer.phone": searchRegex }, { "customer.email": searchRegex }];
    }

    // Populate restaurant and user data
    const bookings = await Booking.find(query)
      .populate("restaurant", "name coverImage logo")
      .populate("user", "name forename email avatar")
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      bookings,
      count,
      page,
      size,
      totalPages: Math.ceil(count / size),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteBookingAdmin
 * @description Deletes a booking from the database completely (admin only).
 */
export const deleteBookingAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    const restaurantDoc = await Restaurant.findById(booking.restaurant).select("name adress phone website");
    const customerEmail = booking.customer?.email;

    if (customerEmail && restaurantDoc && booking.status !== bookingStatus.CANCELLED) {
      const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      const { bookingCancellationTemplate } = await import("../templates/bookingCancellationEmail.js");
      const htmlContent = bookingCancellationTemplate({
        customerName: booking.customer.name,
        restaurantName: restaurantDoc.name,
        date: dateStr,
        time: timeStr,
        reason: "Suppression définitive par un administrateur",
        address: restaurantDoc.adress,
        phone: restaurantDoc.phone,
        website: restaurantDoc.website,
      });

      const subject = `Réservation Supprimée - ${restaurantDoc.name}`;

      await sendEmail({
        email: customerEmail,
        subject,
        message: htmlContent,
      });
    }

    await Booking.findByIdAndDelete(id);

    // Attempt to notify the restaurant via socket if needed
    try {
      getIO()
        .to(`restaurant_${booking.restaurant}`)
        .emit("updateBooking", { ...booking.toObject(), status: "DELETED" });
    } catch (e) {
      // Ignore
    }

    createLog({
      message: `Booking ${id} deleted by ADMIN`,
      userId: req.userId,
      level: logLevels.WARN,
    });

    res.status(200).json({ message: "Réservation supprimée définitivement" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBookingNoteAdmin
 * @description Updates the note of a booking (admin only).
 */
export const updateBookingNoteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    booking.notes = notes;
    await booking.save();

    res.status(200).json({ booking, message: "Note mise à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function sendBookingEmailAdmin
 * @description Resends a confirmation/cancellation email to the client for the booking (admin only)
 */
export const sendBookingEmailAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    const restaurantDoc = await Restaurant.findById(booking.restaurant).select("name adress phone website");
    const customerEmail = booking.customer?.email;

    if (customerEmail && restaurantDoc) {
      const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      const isCancelled = booking.status === bookingStatus.CANCELLED;

      let htmlContent = "";
      let subject = "";

      if (isCancelled) {
        htmlContent = bookingCancellationTemplate({
          customerName: booking.customer.name,
          restaurantName: restaurantDoc.name,
          date: dateStr,
          time: timeStr,
          reason: "Annulation - (Rappel Admin)",
          address: restaurantDoc.adress,
          phone: restaurantDoc.phone,
          website: restaurantDoc.website,
        });
        subject = `Rappel d'annulation - ${restaurantDoc.name}`;
      } else {
        htmlContent = bookingConfirmationTemplate({
          customerName: booking.customer.name,
          restaurantName: restaurantDoc.name,
          date: dateStr,
          time: timeStr,
          guests: booking.guests,
          status: booking.status === bookingStatus.CONFIRMED ? "Confirmée" : "En attente",
          isConfirmed: booking.status === bookingStatus.CONFIRMED,
          address: restaurantDoc.adress,
          phone: restaurantDoc.phone,
          website: restaurantDoc.website,
        });
        subject = `Rappel de réservation - ${restaurantDoc.name}`;
      }

      await sendEmail({
        email: customerEmail,
        subject,
        message: htmlContent,
      });

      res.status(200).json({ message: "Email envoyé avec succès" });
    } else {
      res.status(400).json({ error: "Impossible d'envoyer l'email : adresse email client ou informations du restaurant manquantes." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelBookingAdmin
 * @description Cancels a booking and sends a cancellation email to the client (admin only)
 */
export const cancelBookingAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    if (booking.status === bookingStatus.CANCELLED) {
      res.status(400).json({ error: "Cette réservation est déjà annulée" });
      return;
    }

    booking.status = bookingStatus.CANCELLED;
    await booking.save();

    const restaurantDoc = await Restaurant.findById(booking.restaurant).select("name adress phone website");
    const customerEmail = booking.customer?.email;

    if (customerEmail && restaurantDoc) {
      const dateStr = new Date(booking.bookingDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = new Date(booking.bookingDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      const htmlContent = bookingCancellationTemplate({
        customerName: booking.customer.name,
        restaurantName: restaurantDoc.name,
        date: dateStr,
        time: timeStr,
        reason: "Annulation par un administrateur",
        address: restaurantDoc.adress,
        phone: restaurantDoc.phone,
        website: restaurantDoc.website,
      });

      const subject = `Réservation Annulée - ${restaurantDoc.name}`;

      await sendEmail({
        email: customerEmail,
        subject,
        message: htmlContent,
      });
    }

    // Attempt to notify the restaurant via socket if needed
    try {
      getIO().to(`restaurant_${booking.restaurant}`).emit("updateBooking", booking);
    } catch (e) {
      // Ignore
    }

    createLog({
      message: `Booking ${id} status cancelled by ADMIN`,
      userId: req.userId,
      level: logLevels.WARN,
    });

    res.status(200).json({ booking, message: "Réservation annulée avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function captureBankImprint
 * @description Capture the bank imprint for a No-Show
 */
export const captureBankImprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params; // restaurant ID and booking ID

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    if (booking.restaurant.toString() !== id) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    if (
      booking.bankImprintStatus !== "secured" ||
      !booking.stripeSetupIntentId ||
      !booking.bankImprintAmount ||
      !booking.stripeCustomerId
    ) {
      res.status(400).json({ error: "Empreinte bancaire non valide pour cette réservation" });
      return;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant || !restaurant.stripeAccountId) {
      res.status(400).json({ error: "Le restaurant n'a pas de compte Stripe lié." });
      return;
    }

    // Capture with Stripe
    const paymentIntent = await stripeService.captureSetupIntent(
      booking.stripeSetupIntentId,
      booking.bankImprintAmount,
      booking.stripeCustomerId,
      restaurant.stripeAccountId,
      {
        bookingId: booking._id.toString(),
        restaurantId: booking.restaurant.toString(),
      },
    );

    booking.bankImprintStatus = "captured";
    await booking.save();

    res.status(200).json({ message: "Empreinte bancaire encaissée avec succès", booking });
  } catch (error: any) {
    console.error("Erreur lors de l'encaissement de l'empreinte:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
};

/**
 * @function releaseBankImprint
 * @description Release or cancel the bank imprint (e.g. customer showed up)
 */
export const releaseBankImprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable" });
      return;
    }

    if (booking.restaurant.toString() !== id) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    if (booking.bankImprintStatus !== "secured" || !booking.stripeSetupIntentId) {
      res.status(400).json({ error: "Empreinte bancaire non valide ou déjà traitée" });
      return;
    }

    try {
      await stripeService.cancelSetupIntent(booking.stripeSetupIntentId);
    } catch (e) {
      console.warn("Could not explicitly cancel SetupIntent in Stripe, continuing...", e);
    }

    booking.bankImprintStatus = "released";
    await booking.save();

    res.status(200).json({ message: "Empreinte bancaire libérée avec succès", booking });
  } catch (error: any) {
    console.error("Erreur lors de la libération de l'empreinte:", error);
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
};
