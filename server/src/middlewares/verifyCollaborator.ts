import { Request, Response, NextFunction } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { userRoles } from "../utils/enums/userRoles.js";

/**
 * Middleware to verify that the authenticated user is a collaborator of the restaurant.
 * Must be used after verifyToken middleware.
 * Expects :id or :restaurantId in route params.
 */
export const verifyCollaborator = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const restaurantId = req.params.id || req.params.restaurantId;

    try {
      if (req.userId) {
        const user = await User.findById(req.userId);
        if (user && user.role === userRoles.ADMIN) {
          next();
          return;
        }
      }
      if (!restaurantId) {
        res.status(400).json({ error: "server.restaurants.errors.missing_id" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        res.status(400).json({ error: "server.restaurants.errors.invalid_id" });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
        res.status(404).json({ error: "server.global.errors.not_found" });
        return;
      }

      const isCollaborator = restaurant.collaborators.some((collab) => collab.toString() === req.userId?.toString());

      if (!isCollaborator) {
        res.status(403).json({ error: "server.restaurants.errors.not_collaborator" });
        return;
      }

      req.restaurant = restaurant;
      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
};
