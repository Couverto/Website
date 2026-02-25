import { Request, Response, NextFunction } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { Feature } from "../models/featureModel.js";
import { Plan } from "../models/planModel.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";

/**
 * Middleware to verify if the restaurant has access to a specific dashboard page via its features.
 * Must be used after verifyCollaborator middleware, which populates req.restaurant.
 * @param requiredPage The internal name of the page from AVAILABLE_PAGES (e.g., 'stats', 'tablePlan'), or an array if any match is allowed.
 */
export const verifyFeatureAccess = (requiredPage: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // System Admins bypass the exact restaurant fetch in verifyCollaborator.
      // We grant them full access to all features to allow support and troubleshooting.
      if (!req.restaurant && (req as any).restaurantRole === restaurantRoles.ADMIN) {
        next();
        return;
      }

      const restaurant = req.restaurant;
      if (!restaurant) {
        res.status(400).json({ error: "Restaurant manquant dans la requête" });
        return;
      }

      // Collect all raw feature IDs linked to the restaurant
      const featureIds = new Set<string>();

      // 1. Features from the active plan
      if (restaurant.plan) {
        // Need to fetch the plan since it might not be populated with full features
        const planObj = await Plan.findById(restaurant.plan).populate<{ features: any[] }>("features");
        if (planObj && planObj.features) {
          planObj.features.forEach((f) => {
            if (f.active) featureIds.add(f._id.toString());
          });
        }
      }

      // 2. Extra features directly attached to the restaurant (e.g., by sponsor codes)
      if (restaurant.features && restaurant.features.length > 0) {
        restaurant.features.forEach((fId: any) => featureIds.add(fId.toString()));
      }

      // Fetch the actual activated features
      const activeFeatures = await Feature.find({
        _id: { $in: Array.from(featureIds) },
        active: true,
      });

      // Extract all associatedPages from those active features
      const availablePages = new Set<string>();
      activeFeatures.forEach((feature) => {
        if (feature.associatedPages && Array.isArray(feature.associatedPages)) {
          feature.associatedPages.forEach((page) => availablePages.add(page));
        }
      });

      // Allow access if requiredPage is met
      const requiredPagesArray = Array.isArray(requiredPage) ? requiredPage : [requiredPage];
      const hasAccess = requiredPagesArray.some((page) => availablePages.has(page));

      if (!hasAccess) {
        res.status(403).json({ error: "Votre abonnement actuel ne permet pas d'accéder à cette fonctionnalité." });
        return;
      }

      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
};
