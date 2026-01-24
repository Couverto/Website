import { Request, Response, NextFunction } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { userRoles } from "../utils/enums/userRoles.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";

/**
 * Middleware to verify that the authenticated user is a collaborator of the restaurant and has the required role.
 * Must be used after verifyToken middleware.
 * Expects :id or :restaurantId in route params.
 */
export const verifyCollaborator = (allowedRoles?: string[]) => {
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
        res.status(400).json({ error: "ID du restaurant manquant" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        res.status(400).json({ error: "ID du restaurant invalide" });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ error: "Ressource introuvable" });
        return;
      }

      const isCollaborator = restaurant.collaborators.some((collab) => collab.toString() === req.userId?.toString());
      if (!isCollaborator) {
        res.status(403).json({ error: "Vous n'êtes pas collaborateur de ce restaurant" });
        return;
      }

      // Get user's role from restaurant's collaboratorRoles Map
      const userRole = restaurant.collaboratorRoles.get(req.userId!.toString()) || restaurantRoles.EMPLOYEE;

      // Check if user has required role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(userRole)) {
          res.status(403).json({ error: "Vous n'avez pas les permissions nécessaires pour effectuer cette action" });
          return;
        }
      }

      req.restaurant = restaurant;
      req.restaurantRole = userRole;

      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
};
