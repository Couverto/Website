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
