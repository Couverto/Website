import { Request, Response } from "express";
import crypto from "crypto";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { getIO } from "../sockets/socket.js";
import { sendEmail } from "../utils/sendEmail.js";
import { bookingConfirmationTemplate } from "../templates/bookingConfirmationEmail.js";
import { restaurantBookingNotificationTemplate } from "../templates/restaurantBookingNotification.js";
import { formatBookingDate, formatBookingTime } from "../utils/dateFormatter.js";

// Validate that the booking date falls within the restaurant's opening hours
function validateBookingTime(restaurant: any, bookingDate: string): boolean {
  const date = new Date(bookingDate);

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
 * @function createExternalBooking
 * @description Creates a booking via the external API (restaurant's own form integration).
 * Authenticated via API key (verifyApiKey middleware).
 * Skips bank imprint (external bookings don't go through Stripe flow).
 */
export const createExternalBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurantId;
    const { bookingDate, guests, customer, notes } = req.body;

    // Validate required fields
    if (!bookingDate || !guests || !customer?.name || !customer?.phone || !customer?.email) {
      res.status(400).json({
        error: "Champs requis manquants",
        required: { bookingDate: "ISO 8601", guests: "number", customer: { name: "string", phone: "string", email: "string" } },
      });
      return;
    }

    // Validate guests
    if (typeof guests !== "number" || guests < 1) {
      res.status(400).json({ error: "Le nombre de couverts doit être un nombre supérieur à 0" });
      return;
    }

    // Validate date format
    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: "Format de date invalide. Utilisez le format ISO 8601 (ex: 2026-04-01T19:00:00.000Z)" });
      return;
    }

    // Prevent past bookings
    if (parsedDate < new Date()) {
      res.status(400).json({ error: "Impossible de créer une réservation dans le passé" });
      return;
    }

    const restaurantExists = await Restaurant.findById(restaurantId);
    if (!restaurantExists) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    if (restaurantExists.isClosed) {
      res.status(400).json({ error: "Le restaurant est actuellement fermé aux réservations" });
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
        res.status(400).json({ error: "Le restaurant est exceptionnellement fermé ce jour-là" });
        return;
      }
    }

    // Validate opening hours
    const isValidTime = validateBookingTime(restaurantExists, bookingDate);
    if (!isValidTime) {
      res.status(400).json({ error: "Le restaurant est fermé à cet horaire" });
      return;
    }

    // Prepare booking data
    const bookingData: any = {
      restaurant: restaurantId,
      bookingDate,
      guests,
      customer: {
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone,
      },
      notes: notes || undefined,
      user: null,
      bankImprintStatus: "none",
      cancellationCode: crypto.randomBytes(16).toString("hex"),
    };

    // Capacity check and auto-confirmation
    if (restaurantExists.capacity && restaurantExists.capacity > 0) {
      const bookingTime = new Date(bookingDate).getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      const startTime = new Date(bookingTime - twoHours);
      const endTime = new Date(bookingTime + twoHours);

      const existingBookings = await Booking.find({
        restaurant: restaurantId,
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

      // Table auto-assignment
      if (restaurantExists.zones && restaurantExists.zones.length > 0) {
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

        const availableFittingTables = allTables
          .filter((table) => !occupiedTableIds.has(table.id) && table.seats >= Number(guests))
          .sort((a, b) => {
            if (a.zoneIndex !== b.zoneIndex) return a.zoneIndex - b.zoneIndex;
            return a.seats - b.seats;
          });

        if (availableFittingTables.length > 0) {
          bookingData.tableId = availableFittingTables[0].id;
          bookingData.zoneId = availableFittingTables[0].zoneId;
        }
      }
    }

    const newBooking = await Booking.create(bookingData);

    // Emit real-time event
    try {
      getIO().to(`restaurant_${restaurantId}`).emit("newBooking", newBooking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

    // Send confirmation email to customer
    try {
      if (customer.email) {
        const dateStr = formatBookingDate(bookingDate);
        const timeStr = formatBookingTime(bookingDate);

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
          address: restaurantExists.adress,
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

    // Notify restaurant by email
    if (restaurantExists.email && restaurantExists.sendBookingEmail) {
      try {
        const dateStr = formatBookingDate(bookingDate);
        const timeStr = formatBookingTime(bookingDate);

        await sendEmail({
          email: restaurantExists.email,
          subject: `Nouvelle réservation (API) - ${customer.name}`,
          message: restaurantBookingNotificationTemplate({
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            date: dateStr,
            time: timeStr,
            guests: guests,
            notes: notes,
            restaurantName: restaurantExists.name,
            restaurantId: restaurantExists._id.toString(),
          }),
        });
      } catch (restaurantMailError) {
        console.error("Restaurant notification email failed", restaurantMailError);
      }
    }

    createLog({
      message: `External API booking created for restaurant ${restaurantId} by ${customer.name}`,
      level: logLevels.INFO,
    });

    res.status(201).json({
      booking: {
        _id: newBooking._id,
        status: newBooking.status,
        bookingDate: newBooking.bookingDate,
        guests: newBooking.guests,
        customer: newBooking.customer,
        notes: newBooking.notes,
        tableId: newBooking.tableId,
        zoneId: newBooking.zoneId,
        createdAt: newBooking.createdAt,
      },
      message: "Réservation créée via l'API",
    });
  } catch (err: any) {
    console.error("External booking error:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
