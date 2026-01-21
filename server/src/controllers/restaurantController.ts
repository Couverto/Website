import { Request, Response } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { userRoles } from "../utils/enums/userRoles.js";

/**
 * @function getRestaurants
 * @description Retrieves all restaurants with pagination and search.
 */
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  const size = parseInt(req.query.size as string) || 10;
  const page = parseInt(req.query.page as string) || 0;
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
    const { name, slug, address, city, phone, website, ...otherFields } = req.body;
    const collaborators = [];

    const creator = await User.findById(req.userId);
    if (!creator) {
      res.status(400).json({ error: "server.global.errors.no_such_user" });
      return;
    }

    collaborators.push(creator._id);

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      res.status(409).json({ error: "server.restaurants.errors.slug_taken" });
      return;
    }

    const restaurant = await Restaurant.create({
      name,
      slug,
      adress: address, // Note: model uses 'adress' (typo in model but keeping consistency)
      city,
      phone,
      website,
      collaborators,
      ...otherFields,
    });

    createLog({
      message: `Restaurant '${name}' created successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ restaurant, message: "server.restaurants.messages.created" });
  } catch (err: any) {
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
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' updated successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "server.restaurants.messages.updated" });
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
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.restaurants.messages.deleted" });
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
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    // Verify user is a collaborator
    if (!restaurant.collaborators.some((c) => c.toString() === req.userId?.toString())) {
      res.status(403).json({ error: "server.global.errors.forbidden" });
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
  const size = parseInt(req.query.size as string) || 12; // Larger page size for grid
  const page = parseInt(req.query.page as string) || 0;
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
      res.status(404).json({ error: "server.global.errors.not_found" });
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
      res.status(404).json({ error: "server.global.errors.not_found" });
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

    res.status(200).json({ restaurant });
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

    // Total unique clients
    const uniqueClients = await Booking.distinct("customer.phone", { restaurant: id });

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
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    res.status(200).json({ collaborators: restaurant.collaborators });
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
      res.status(404).json({ error: "server.global.errors.no_such_user" });
      return;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    const isAlreadyCollaborator = restaurant.collaborators.some((collab) => collab.toString() === userId);

    if (isAlreadyCollaborator) {
      res.status(400).json({ error: "server.restaurants.errors.already_collaborator" });
      return;
    }

    restaurant.collaborators.push(userId);
    await restaurant.save();

    createLog({
      message: `User ${user.username} added as collaborator to ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.restaurants.messages.collaborator_added" });
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
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    // Cannot remove the last collaborator
    if (restaurant.collaborators.length <= 1) {
      res.status(400).json({ error: "server.restaurants.errors.cannot_remove_last" });
      return;
    }

    const collaboratorIndex = restaurant.collaborators.findIndex((collab) => collab.toString() === collaboratorId);

    if (collaboratorIndex === -1) {
      res.status(404).json({ error: "server.restaurants.errors.not_collaborator" });
      return;
    }

    restaurant.collaborators.splice(collaboratorIndex, 1);
    await restaurant.save();

    createLog({
      message: `Collaborator removed from ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.restaurants.messages.collaborator_removed" });
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
  const { name, description, phone, website, coverImage, images, menu, openingHours, cuisineType, priceRange } = req.body;

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(phone && { phone }),
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
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' settings updated`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "server.restaurants.messages.settings_updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
