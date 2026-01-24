import { Request, Response } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";
import { getPaginationParams } from "../utils/pagination.js";
import { sendEmail } from "../utils/sendEmail.js";
import { collaboratorEmailTemplate } from "../templates/collaboratorEmail.js";

/**
 * @function getRestaurants
 * @description Retrieves all restaurants with pagination and search.
 */
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  const { page, size } = getPaginationParams(req);
  const search = (req.query.search as string) || "";

  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const restaurants = await Restaurant.find(query)
      .populate("collaborators", "name forename email avatar")
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const count = await Restaurant.countDocuments(query);

    res.status(200).json({ restaurants, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createRestaurant
 * @description Creates a new restaurant.
 */
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, address, city, phone, website, planId, ...otherFields } = req.body;
    const collaborators = [];

    const creator = await User.findById(req.userId);
    if (!creator) {
      res.status(400).json({ error: "Utilisateur introuvable" });
      return;
    }

    collaborators.push(creator._id);

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      res.status(409).json({ error: "Ce slug est déjà utilisé" });
      return;
    }

    // Create collaboratorRoles Map with creator as admin
    const collaboratorRoles = new Map<string, string>();
    collaboratorRoles.set(creator._id.toString(), restaurantRoles.ADMIN);

    // Set subscription end date if plan is provided
    const subscriptionEndDate = planId ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

    const restaurant = await Restaurant.create({
      name,
      slug,
      adress: address, // Note: model uses 'adress' (typo in model but keeping consistency)
      city,
      phone,
      website,
      collaborators,
      collaboratorRoles,
      plan: planId || null,
      subscriptionStatus: planId ? "active" : "none",
      autoRenew: true,
      subscriptionEndDate,
      ...otherFields,
    });

    createLog({
      message: `Restaurant '${name}' created successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ restaurant, message: "Restaurant créé avec succès" });
  } catch (err: any) {
    // Handle duplicate key errors with user-friendly messages
    if (err.code === 11000) {
      if (err.keyPattern?.adress) {
        res.status(409).json({ error: "Cette adresse est déjà utilisée par un autre restaurant" });
        return;
      }
      if (err.keyPattern?.slug) {
        res.status(409).json({ error: "Ce slug est déjà utilisé" });
        return;
      }
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateRestaurant
 * @description Updates a restaurant by ID.
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(req.body.address && { adress: req.body.address }), // Handle address mapping
      },
      { new: true },
    );

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' updated successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "Restaurant mis à jour avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteRestaurant
 * @description Deletes a restaurant by ID.
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Protection: If last admin but others still exist, block deletion
    // Count admins from collaboratorRoles Map
    let adminCount = 0;
    restaurant.collaboratorRoles.forEach((role) => {
      if (role === restaurantRoles.ADMIN) adminCount++;
    });

    if (adminCount <= 1 && restaurant.collaborators.length > 1) {
      res.status(400).json({
        error: "Vous ne pouvez pas supprimer le restaurant alors qu'il reste d'autres collaborateurs. Retirez-les d'abord.",
      });
      return;
    }

    await Restaurant.findByIdAndDelete(id);

    createLog({
      message: `Restaurant '${restaurant.name}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Restaurant supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function toggleRestaurantClosed
 * @description Toggles the closed status of a restaurant.
 */
export const toggleRestaurantClosed = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Verify user is a collaborator
    if (!restaurant.collaborators.some((c) => c.toString() === req.userId?.toString())) {
      res.status(403).json({ error: "server.global.errors.forbidden" });
      return;
    }

    // Prevent reopening if no active plan
    if (restaurant.isClosed && !restaurant.plan) {
      res.status(400).json({
        error: "Vous devez souscrire à un abonnement pour ouvrir votre restaurant.",
        requiresPlan: true,
      });
      return;
    }

    restaurant.isClosed = !restaurant.isClosed;
    await restaurant.save();

    createLog({
      message: `Restaurant '${restaurant.name}' ${restaurant.isClosed ? "closed" : "reopened"}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      restaurant,
      message: restaurant.isClosed ? "server.restaurants.messages.closed" : "server.restaurants.messages.reopened",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function isRestaurantOpen
 * @description Helper to determine if a restaurant is currently open.
 */
const isRestaurantOpen = (openingHours: any) => {
  if (!openingHours) return false;

  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  // Handle Mongoose Map or plain object
  const daySchedule = openingHours.get ? openingHours.get(currentDay) : openingHours[currentDay];

  if (!daySchedule || daySchedule.isClosed || !daySchedule.periods || daySchedule.periods.length === 0) return false;

  return daySchedule.periods.some((period: { open: string; close: string }) => {
    return currentTime >= period.open && currentTime <= period.close;
  });
};

/**
 * @function convertMapToObject
 * @description Helper to convert Mongoose Map to plain object for JSON serialization.
 */
const convertOpeningHoursToObject = (openingHours: any) => {
  if (!openingHours) return {};
  if (openingHours instanceof Map || typeof openingHours.entries === "function") {
    const result: Record<string, any> = {};
    openingHours.forEach((value: any, key: string) => {
      result[key] = value;
    });
    return result;
  }
  return openingHours;
};

/**
 * @function getPublicRestaurants
 * @description Retrieves public restaurants with search and filters.
 */
export const getPublicRestaurants = async (req: Request, res: Response): Promise<void> => {
  const { page, size } = getPaginationParams(req, 12);
  const search = (req.query.search as string) || "";
  const city = (req.query.city as string) || "";
  const priceRange = (req.query.priceRange as string) || "";
  const cuisineType = (req.query.cuisineType as string) || "";
  const date = (req.query.date as string) || "";
  const guests = parseInt(req.query.guests as string) || 0;

  try {
    const query: any = { isClosed: false }; // Only show open restaurants by default

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    if (priceRange) {
      query.priceRange = priceRange;
    }
    if (cuisineType) {
      query.cuisineType = { $regex: cuisineType, $options: "i" };
    }
    if (guests > 0) {
      query.capacity = { $gte: guests };
    }
    if (date) {
      const queryDate = new Date(date);
      if (!isNaN(queryDate.getTime())) {
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = dayNames[queryDate.getDay()];

        // Ensure the restaurant is open on this specific day
        // 1. The day entry must not be marked as closed
        // 2. The day entry must have at least one opening period
        // Note: We use dynamic key access matching Mongoose Map structure
        query[`openingHours.${dayName}.isClosed`] = { $ne: true };
        query[`openingHours.${dayName}.periods.0`] = { $exists: true };
      }
    }

    const restaurants = await Restaurant.find(query)
      .select("-collaborators -createdAt -updatedAt") // Exclude internal/private fields
      .sort({ rating: -1, name: 1 }) // Sort by rating desc
      .skip(page * size)
      .limit(size);

    const count = await Restaurant.countDocuments(query);

    // Calculate isOpenNow for each restaurant
    const restaurantsWithStatus = restaurants.map((r) => {
      const restaurantObj = r.toObject();
      return {
        ...restaurantObj,
        openingHours: convertOpeningHoursToObject(r.openingHours),
        isOpenNow: isRestaurantOpen(r.openingHours),
      };
    });

    res.status(200).json({ restaurants: restaurantsWithStatus, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantSlots
 * @description Retrieves available time slots for a restaurant on a specific date.
 */
export const getRestaurantSlots = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    res.status(400).json({ error: "Date parameter is required" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const queryDate = new Date(date as string);
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[queryDate.getDay()];

    // Check if openingHours exists and is not empty
    if (
      !restaurant.openingHours ||
      (restaurant.openingHours instanceof Map ? restaurant.openingHours.size === 0 : Object.keys(restaurant.openingHours).length === 0)
    ) {
      res.status(200).json({ slots: [] });
      return;
    }

    // Access the day schedule (handle Mongoose Map)
    const daySchedule: any =
      restaurant.openingHours instanceof Map ? restaurant.openingHours.get(dayName) : (restaurant.openingHours as any)[dayName];

    if (!daySchedule || daySchedule.isClosed || !daySchedule.periods || daySchedule.periods.length === 0) {
      res.status(200).json({ slots: [] });
      return;
    }

    const allSlots = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    });

    const slots = allSlots.filter((slot) => {
      const [slotHour, slotMinute] = slot.split(":").map(Number);
      const slotTime = slotHour * 60 + slotMinute;

      return daySchedule.periods.some((period: any) => {
        const [openHour, openMinute] = period.open.split(":").map(Number);
        const [closeHour, closeMinute] = period.close.split(":").map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        return slotTime >= openTime && slotTime <= closeTime;
      });
    });

    res.status(200).json({ slots });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getPublicRestaurantById
 * @description Retrieves a single public restaurant by ID.
 */
export const getPublicRestaurantById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).select("-collaborators -createdAt -updatedAt"); // Exclude internal/private fields

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const restaurantWithStatus = {
      ...restaurant.toObject(),
      openingHours: convertOpeningHoursToObject(restaurant.openingHours),
      isOpenNow: isRestaurantOpen(restaurant.openingHours),
    };

    res.status(200).json({ restaurant: restaurantWithStatus });
  } catch (err: any) {
    console.error(`[getPublicRestaurantById] Error:`, err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getMyRestaurants
 * @description Retrieves restaurants where the user is a collaborator.
 */
export const getMyRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find({ collaborators: req.userId })
      .select("-collaborators -createdAt -updatedAt")
      .sort({ name: 1 });

    res.status(200).json({ restaurants });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantById
 * @description Retrieves a restaurant by ID for collaborators.
 */
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Restaurant is already attached by verifyCollaborator middleware
    const restaurant = await Restaurant.findById(req.params.id).populate("collaborators", "name forename email avatar");

    // Get the requesting user's role for this restaurant
    const userRole = restaurant?.collaboratorRoles.get(req.userId!.toString()) || restaurantRoles.EMPLOYEE;

    res.status(200).json({ restaurant, userRole });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantStats
 * @description Retrieves statistics for a restaurant dashboard.
 */
export const getRestaurantStats = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { Booking } = await import("../models/bookingModel.js");
  const { bookingStatus } = await import("../utils/enums/bookingStatus.js");

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's bookings
    const todayBookings = await Booking.countDocuments({
      restaurant: id,
      bookingDate: { $gte: startOfToday },
      status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] },
    });

    // Today's guests
    const todayGuests = await Booking.aggregate([
      {
        $match: {
          restaurant: new (await import("mongoose")).Types.ObjectId(id),
          bookingDate: { $gte: startOfToday },
          status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] },
        },
      },
      { $group: { _id: null, total: { $sum: "$guests" } } },
    ]);

    // This week's bookings
    const weekBookings = await Booking.countDocuments({
      restaurant: id,
      bookingDate: { $gte: startOfWeek },
      status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] },
    });

    // This month's bookings
    const monthBookings = await Booking.countDocuments({
      restaurant: id,
      bookingDate: { $gte: startOfMonth },
      status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] },
    });

    // Upcoming bookings (next 7 days)
    const upcomingBookings = await Booking.find({
      restaurant: id,
      bookingDate: { $gte: now },
      status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] },
    })
      .sort({ bookingDate: 1 })
      .limit(10)
      .populate("user", "name forename avatar");

    // Daily stats for the last 7 days
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Booking.aggregate([
      {
        $match: {
          restaurant: new (await import("mongoose")).Types.ObjectId(id),
          bookingDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Hourly distribution for today
    const hourlyStats = await Booking.aggregate([
      {
        $match: {
          restaurant: new (await import("mongoose")).Types.ObjectId(id),
          bookingDate: { $gte: startOfToday, $lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $hour: "$bookingDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await Booking.aggregate([
      {
        $match: {
          restaurant: new (await import("mongoose")).Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Total unique clients
    const uniqueClients = await Booking.distinct("customer.phone", { restaurant: id });

    // Guest Distribution
    const guestDistribution = await Booking.aggregate([
      { $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id) } },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $lte: ["$guests", 2] }, then: "1-2" },
                { case: { $lte: ["$guests", 4] }, then: "3-4" },
                { case: { $lte: ["$guests", 6] }, then: "5-6" },
              ],
              default: "7+",
            },
          },
        },
      },
      { $group: { _id: "$range", count: { $sum: 1 } } },
    ]).then((res) => res.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}));

    // Cancellation Rate
    const totalBookingsAllTime = await Booking.countDocuments({
      restaurant: id,
      status: { $ne: bookingStatus.DRAFT },
    });
    const cancelledBookingsAllTime = await Booking.countDocuments({
      restaurant: id,
      status: bookingStatus.CANCELLED,
    });
    const cancellationRate = totalBookingsAllTime > 0 ? (cancelledBookingsAllTime / totalBookingsAllTime) * 100 : 0;

    // Average Guests
    const averageGuestsResult = await Booking.aggregate([
      { $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } },
      { $group: { _id: null, avg: { $avg: "$guests" } } },
    ]);
    const averageGuests = averageGuestsResult[0]?.avg || 0;

    // Average Lead Time
    const leadTimeResult = await Booking.aggregate([
      { $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } },
      {
        $project: {
          leadTime: { $subtract: ["$bookingDate", "$createdAt"] },
        },
      },
      { $group: { _id: null, avgLeadTime: { $avg: "$leadTime" } } },
    ]);
    const averageLeadTime = leadTimeResult[0]?.avgLeadTime ? leadTimeResult[0].avgLeadTime / (1000 * 60 * 60 * 24) : 0;

    // Busiest Days
    const busyDays = await Booking.aggregate([
      { $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } },
      {
        $group: {
          _id: { $dayOfWeek: "$bookingDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      stats: {
        today: {
          bookings: todayBookings,
          guests: todayGuests[0]?.total || 0,
        },
        week: {
          bookings: weekBookings,
        },
        month: {
          bookings: monthBookings,
        },
        totalClients: uniqueClients.length,
        dailyStats: dailyStats.map((d) => ({ date: d._id, count: d.count })),
        hourlyStats: hourlyStats.map((h) => ({ hour: h._id, count: h.count })),
        statusBreakdown: statusBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        guestDistribution,

        cancellationRate: parseFloat(cancellationRate.toFixed(1)),
        averageGuests: parseFloat(averageGuests.toFixed(1)),
        averageLeadTime: parseFloat(averageLeadTime.toFixed(1)),
        busyDays: busyDays.map((d) => ({ day: d._id, count: d.count })),
      },
      upcomingBookings,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getCollaborators
 * @description Retrieves all collaborators of a restaurant.
 */
export const getCollaborators = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate("collaborators", "name forename email avatar username createdAt");

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Map collaborators to include their role from collaboratorRoles
    const collaboratorsWithRoles = restaurant.collaborators.map((collab: any) => {
      const role = restaurant.collaboratorRoles.get(collab._id.toString()) || restaurantRoles.EMPLOYEE;
      return {
        ...collab.toObject(),
        restaurantRole: role,
      };
    });

    res.status(200).json({ collaborators: collaboratorsWithRoles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function addCollaborator
 * @description Adds a user as collaborator to a restaurant.
 */
export const addCollaborator = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const isAlreadyCollaborator = restaurant.collaborators.some((collab) => collab.toString() === userId);

    if (isAlreadyCollaborator) {
      res.status(400).json({ error: "server.restaurants.errors.already_collaborator" });
      return;
    }

    restaurant.collaborators.push(userId);
    restaurant.collaboratorRoles.set(userId, restaurantRoles.EMPLOYEE);
    await restaurant.save();

    // Send email notification
    try {
      if (user.email) {
        const htmlContent = collaboratorEmailTemplate({
          name: user.forename,
          restaurantName: restaurant.name,
          role: restaurantRoles.EMPLOYEE,
          action: "added",
        });
        await sendEmail({
          email: user.email,
          subject: `Invitation à collaborer - ${restaurant.name}`,
          message: htmlContent,
        });
      }
    } catch (emailErr) {
      console.error("Collaborator added email failed", emailErr);
    }

    createLog({
      message: `User ${user.username} added as collaborator to ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Collaborateur ajouté" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function removeCollaborator
 * @description Removes a collaborator from a restaurant.
 */
export const removeCollaborator = async (req: Request, res: Response): Promise<void> => {
  const { id, collaboratorId } = req.params;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Cannot remove the last collaborator
    if (restaurant.collaborators.length <= 1) {
      res.status(400).json({ error: "server.restaurants.errors.cannot_remove_last" });
      return;
    }

    const collaboratorIndex = restaurant.collaborators.findIndex((collab) => collab.toString() === collaboratorId);

    if (collaboratorIndex === -1) {
      res.status(404).json({ error: "Vous n'êtes pas collaborateur de ce restaurant" });
      return;
    }

    const user = await User.findById(collaboratorId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    // Get collaborator's role from restaurant
    const collaboratorRole = restaurant.collaboratorRoles.get(collaboratorId) || restaurantRoles.EMPLOYEE;

    // Protection: Managers cannot remove Administrators
    if (collaboratorRole === restaurantRoles.ADMIN && req.restaurantRole !== restaurantRoles.ADMIN) {
      res.status(403).json({ error: "Vous ne pouvez pas retirer un administrateur" });
      return;
    }

    // Admin Persistence: Cannot remove the last Administrator
    if (collaboratorRole === restaurantRoles.ADMIN) {
      let adminCount = 0;
      restaurant.collaboratorRoles.forEach((role) => {
        if (role === restaurantRoles.ADMIN) adminCount++;
      });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Un restaurant doit avoir au moins un administrateur" });
        return;
      }
    }

    restaurant.collaborators.splice(collaboratorIndex, 1);
    restaurant.collaboratorRoles.delete(collaboratorId);
    await restaurant.save();

    // Send email notification
    try {
      if (user.email) {
        const htmlContent = collaboratorEmailTemplate({
          name: user.forename,
          restaurantName: restaurant.name,
          action: "removed",
        });
        await sendEmail({
          email: user.email,
          subject: `Fin de collaboration - ${restaurant.name}`,
          message: htmlContent,
        });
      }
    } catch (emailErr) {
      console.error("Collaborator removed email failed", emailErr);
    }

    createLog({
      message: `Collaborator removed from ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Collaborateur retiré" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateRestaurantSettings
 * @description Updates restaurant settings (for collaborators).
 */
export const updateRestaurantSettings = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, phone, email, adress, city, website, coverImage, images, menu, openingHours, cuisineType, priceRange } =
    req.body;

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(adress && { adress }),
        ...(city && { city }),
        ...(website !== undefined && { website }),
        ...(coverImage !== undefined && { coverImage }),
        ...(images && { images }),
        ...(menu && { menu }),
        ...(openingHours && { openingHours }),
        ...(cuisineType && { cuisineType }),
        ...(priceRange && { priceRange }),
        ...(req.body.shortDescription !== undefined && { shortDescription: req.body.shortDescription }),
        ...(req.body.features && { features: req.body.features }),
        ...(req.body.paymentMethods && { paymentMethods: req.body.paymentMethods }),
        ...(req.body.socials && { socials: req.body.socials }),
        ...(req.body.capacity !== undefined && { capacity: req.body.capacity }),
      },
      { new: true },
    );

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' settings updated`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "Paramètres mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateCollaboratorRole
 * @description Updates the role of a collaborator in a restaurant.
 */
export const updateCollaboratorRole = async (req: Request, res: Response): Promise<void> => {
  const { id, collaboratorId } = req.params;
  const { role } = req.body;

  if (!Object.values(restaurantRoles).includes(role)) {
    res.status(400).json({ error: "Rôle invalide" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const isCollaborator = restaurant.collaborators.some((collab) => collab.toString() === collaboratorId);
    if (!isCollaborator) {
      res.status(404).json({ error: "Utilisateur n'est pas collaborateur de ce restaurant" });
      return;
    }

    const user = await User.findById(collaboratorId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    // Get current role from restaurant's collaboratorRoles
    const currentRole = restaurant.collaboratorRoles.get(collaboratorId) || restaurantRoles.EMPLOYEE;

    // Protection: Managers cannot change the role of an Administrator
    if (currentRole === restaurantRoles.ADMIN && req.restaurantRole !== restaurantRoles.ADMIN) {
      res.status(403).json({ error: "Vous ne pouvez pas modifier le rôle d'un administrateur" });
      return;
    }

    // Admin Persistence: Cannot downgrade the last Administrator
    if (currentRole === restaurantRoles.ADMIN && role !== restaurantRoles.ADMIN) {
      let adminCount = 0;
      restaurant.collaboratorRoles.forEach((r) => {
        if (r === restaurantRoles.ADMIN) adminCount++;
      });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Un restaurant doit avoir au moins un administrateur" });
        return;
      }
    }

    restaurant.collaboratorRoles.set(collaboratorId, role);
    await restaurant.save();

    createLog({
      message: `Role of collaborator ${user.username} updated to ${role} in ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Rôle mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
