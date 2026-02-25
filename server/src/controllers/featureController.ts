import { Request, Response } from "express";
import { Feature } from "../models/featureModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function getFeatures
 * @description Retrieves all features sorted by position.
 */
export const getFeatures = async (req: Request, res: Response): Promise<void> => {
  try {
    const features = await Feature.find().sort({ position: 1 });
    res.status(200).json({ features });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getAllFeatures
 * @description Retrieves all features with pagination and search. For admin.
 */
export const getAllFeatures = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 50;
  const name = (req.query.name as string) || "";

  try {
    const query = { name: { $regex: name, $options: "i" } };
    const features = await Feature.find(query)
      .sort({ position: 1 })
      .skip(page * size)
      .limit(size);
    const count = await Feature.countDocuments(query);
    res.status(200).json({ features, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createFeature
 * @description Creates a new feature. Admin only.
 */
export const createFeature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { associatedPages, ...otherFields } = req.body;

    if (associatedPages && Array.isArray(associatedPages) && associatedPages.length > 0) {
      // Check if any of these pages are already claimed by an existing feature
      const conflictingFeature = await Feature.findOne({
        associatedPages: { $in: associatedPages },
      });

      if (conflictingFeature) {
        // Find which pages specifically conflict to return a clear error
        const conflicts = associatedPages.filter((p) => conflictingFeature.associatedPages?.includes(p));
        const conflictStr = conflicts.join(", ");
        res.status(400).json({
          error: `Impossible de lier ces pages. La fonctionnalité '${conflictingFeature.name}' utilise déjà les pages suivantes : ${conflictStr}`,
        });
        return;
      }
    }

    const feature = await Feature.create(req.body);
    createLog({
      message: `Feature '${feature.name}' created`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(201).json({ feature, message: "Fonctionnalité créée" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateFeature
 * @description Updates a feature. Admin only.
 */
export const updateFeature = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { associatedPages } = req.body;

    if (associatedPages && Array.isArray(associatedPages) && associatedPages.length > 0) {
      // Check if any of these pages are already claimed by an existing feature (other than the current one)
      const conflictingFeature = await Feature.findOne({
        _id: { $ne: id },
        associatedPages: { $in: associatedPages },
      });

      if (conflictingFeature) {
        const conflicts = associatedPages.filter((p) => conflictingFeature.associatedPages?.includes(p));
        const conflictStr = conflicts.join(", ");
        res.status(400).json({
          error: `Impossible de lier ces pages. La fonctionnalité '${conflictingFeature.name}' utilise déjà les pages suivantes : ${conflictStr}`,
        });
        return;
      }
    }

    const feature = await Feature.findByIdAndUpdate(id, req.body, { new: true });
    if (!feature) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }
    createLog({
      message: `Feature '${feature.name}' updated`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(200).json({ feature, message: "Fonctionnalité mise à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteFeature
 * @description Deletes a feature. Admin only.
 */
export const deleteFeature = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const feature = await Feature.findByIdAndDelete(id);
    if (!feature) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Optional: Remove this feature from all plans
    const { Plan } = await import("../models/planModel.js");
    await Plan.updateMany({}, { $pull: { features: id } });

    createLog({
      message: `Feature '${feature.name}' deleted`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(200).json({ message: "Fonctionnalité supprimée" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
