import { Request, Response } from "express";
import { Payment } from "../models/paymentModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Plan } from "../models/planModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function getRestaurantPayments
 * @description Retrieves payment history for a restaurant.
 */
export const getRestaurantPayments = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const payments = await Payment.find({ restaurant: id }).sort({ createdAt: -1 }).populate("plan", "name price");

    res.status(200).json({ payments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createPayment
 * @description Creates a new payment record for a restaurant.
 */
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const { restaurantId, planId, amount, paymentMethod } = req.body;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: "Plan introuvable" });
      return;
    }

    const payment = await Payment.create({
      restaurant: restaurantId,
      plan: planId,
      planName: plan.name,
      amount: amount || plan.price,
      status: "completed",
      paymentMethod: paymentMethod || "card",
    });

    // Update restaurant subscription
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    restaurant.plan = plan._id as any;
    restaurant.subscriptionStatus = "active";
    restaurant.subscriptionEndDate = subscriptionEndDate;
    restaurant.autoRenew = true; // defaulting to autoRenew true on new payment

    // Feature: Auto-Reopen if restaurant was closed due to cancelled plan
    const wasClosed = restaurant.isClosed;
    if (wasClosed) {
      restaurant.isClosed = false;
    }

    await restaurant.save();

    createLog({
      message: `Payment of ${payment.amount}€ recorded for restaurant ${restaurant.name} - ${wasClosed ? "Reopened" : "Renewed"}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({
      payment,
      message: "Paiement enregistré",
      reopened: wasClosed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateSubscription
 * @description Updates restaurant subscription settings (plan, autoRenew).
 */
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { planId, autoRenew } = req.body;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    if (planId !== undefined) {
      const plan = await Plan.findById(planId);
      if (!plan) {
        res.status(404).json({ error: "Plan introuvable" });
        return;
      }
      restaurant.plan = plan._id as any;
    }

    if (autoRenew !== undefined) {
      restaurant.autoRenew = autoRenew;
    }

    await restaurant.save();

    createLog({
      message: `Subscription updated for restaurant ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "Abonnement mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getSubscription
 * @description Retrieves subscription details for a restaurant.
 */
export const getSubscription = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate("plan");
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    res.status(200).json({
      plan: restaurant.plan,
      subscriptionStatus: restaurant.subscriptionStatus,
      autoRenew: restaurant.autoRenew,
      subscriptionEndDate: restaurant.subscriptionEndDate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelSubscription
 * @description Cancels the restaurant subscription and closes the restaurant.
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    // Cancel subscription and close restaurant
    restaurant.subscriptionStatus = "cancelled";
    restaurant.autoRenew = false;
    restaurant.plan = null as any;
    restaurant.isClosed = true;

    await restaurant.save();

    createLog({
      message: `Subscription cancelled for restaurant ${restaurant.name} - Restaurant is now closed`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Abonnement résilié. Le restaurant est maintenant fermé." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
