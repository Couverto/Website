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

  try {
    const query: any = {};

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

    const restaurants = await Restaurant.find(query)
      .select("-collaborators -createdAt -updatedAt") // Exclude internal/private fields
      .sort({ rating: -1, name: 1 }) // Sort by rating desc
      .skip(page * size)
      .limit(size);

    const count = await Restaurant.countDocuments(query);

    res.status(200).json({ restaurants, count });
  } catch (err: any) {
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
