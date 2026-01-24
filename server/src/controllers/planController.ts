import { Request, Response } from "express";
import { Plan } from "../models/planModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function getPlans
 * @description Retrieves active plans sorted by position. Public access.
 */
export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await Plan.find({ active: true }).sort({ position: 1 });
    res.status(200).json({ plans });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const name = (req.query.name as string) || "";

  try {
    const plans = await Plan.find({ name: { $regex: name, $options: "i" } })
      .sort({ position: 1 })
      .skip(page * size)
      .limit(size);
    const count = await Plan.countDocuments({ name: { $regex: name, $options: "i" } });
    res.status(200).json({ plans, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createPlan
 * @description Creates a new plan. Admin only.
 */
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = await Plan.create(req.body);
    createLog({
      message: `Plan '${plan.name}' created`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(201).json({ plan, message: "Plan créé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updatePlan
 * @description Updates a plan. Admin only.
 */
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });
    if (!plan) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }
    createLog({
      message: `Plan '${plan.name}' updated`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(200).json({ plan, message: "Plan mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deletePlan
 * @description Deletes a plan. Admin only.
 */
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }
    createLog({
      message: `Plan '${plan.name}' deleted`,
      userId: req.userId,
      level: logLevels.INFO,
    });
    res.status(200).json({ message: "Plan supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
