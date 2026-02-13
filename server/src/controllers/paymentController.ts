import { Request, Response } from "express";
import { Payment } from "../models/paymentModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Plan } from "../models/planModel.js";
import { stripeService } from "../services/stripeService.js";
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
 * @function getPayments
 * @description Retrieves all payments for administrative view.
 */
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;

  try {
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .populate("restaurant", "name")
      .populate("plan", "name");
    const count = await Payment.countDocuments({});
    res.status(200).json({ payments, count });
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
    const restaurant = await Restaurant.findById(restaurantId).populate("collaborators");
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: "Plan introuvable" });
      return;
    }

    // Check if Stripe is configured
    const stripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET;

    // If no active Stripe subscription and plan requires payment, launch Stripe checkout (if configured)
    if (!restaurant.stripeSubscriptionId && plan.price > 0 && plan.stripePriceId && stripeConfigured) {
      // Get owner email for Stripe customer
      const owner = (restaurant.collaborators as any[])?.[0];
      const customerEmail = owner?.email || "client@couverto.fr";

      // Create or reuse Stripe customer
      let customerId = restaurant.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(customerEmail, restaurant.name);
        customerId = customer.id;
        restaurant.stripeCustomerId = customerId;
        await restaurant.save();
      }

      // Create Stripe checkout session - redirect back to plan page with success param
      const successUrl = `${process.env.CORS_ORIGIN}/restaurant/${restaurantId}/plan?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.CORS_ORIGIN}/restaurant/${restaurantId}/plan?payment=cancelled`;

      const session = await stripeService.createCheckoutSession({ id: customerId }, plan.stripePriceId, successUrl, cancelUrl, {
        restaurantId: restaurantId,
        planId: plan._id.toString(),
        type: "RESUBSCRIPTION",
      });

      res.status(200).json({ url: session.url, requiresStripe: true });
      return;
    }

    // Stripe not configured or free plan: proceed with direct activation (dev mode)
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
    restaurant.autoRenew = true;
    // Note: Restaurant stays closed - user must manually open it

    await restaurant.save();

    createLog({
      message: `Payment of ${payment.amount}€ recorded for restaurant ${restaurant.name} - Subscription activated`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({
      payment,
      message: "Paiement enregistré",
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

      // Update Stripe subscription with new price if applicable
      if (restaurant.stripeSubscriptionId && plan.stripePriceId) {
        try {
          // Retrieve current subscription to get the item ID
          const subscription = await stripeService.retrieveSubscription(restaurant.stripeSubscriptionId);
          const subscriptionItemId = (subscription as any).items?.data?.[0]?.id;

          if (subscriptionItemId) {
            // Update the subscription item with the new price
            await stripeService.updateSubscriptionItem(subscriptionItemId, plan.stripePriceId);
            console.log(`[Stripe] Subscription item ${subscriptionItemId} updated to price ${plan.stripePriceId}`);
          }
        } catch (stripeError: any) {
          console.error(`[Stripe] Failed to update subscription price:`, stripeError.message);
        }
      }

      restaurant.plan = plan._id as any;
    }

    if (autoRenew !== undefined) {
      restaurant.autoRenew = autoRenew;

      // Sync with Stripe: cancel_at_period_end = !autoRenew
      if (restaurant.stripeSubscriptionId) {
        try {
          await stripeService.updateSubscription(restaurant.stripeSubscriptionId, {
            cancel_at_period_end: !autoRenew,
          });
          console.log(`[Stripe] Subscription ${restaurant.stripeSubscriptionId} updated: cancel_at_period_end=${!autoRenew}`);
        } catch (stripeError: any) {
          console.error(`[Stripe] Failed to update subscription:`, stripeError.message);
        }
      }
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
    const restaurant = await Restaurant.findById(id).populate({
      path: "plan",
      populate: { path: "features" },
    });
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

    // Cancel on Stripe if applicable
    if (restaurant.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(restaurant.stripeSubscriptionId);
        console.log(`[Stripe] Subscription ${restaurant.stripeSubscriptionId} cancelled for restaurant ${id}`);
      } catch (stripeError: any) {
        console.error(`[Stripe] Failed to cancel subscription ${restaurant.stripeSubscriptionId}:`, stripeError.message);
        // We continue even if Stripe fails, to ensure the restaurant is closed in our DB
      }
    }

    // Cancel subscription and close restaurant in our database
    restaurant.subscriptionStatus = "cancelled";
    restaurant.autoRenew = false;
    restaurant.plan = null as any;
    restaurant.isClosed = true;
    restaurant.stripeSubscriptionId = null as any; // Clear the subscription ID

    await restaurant.save();

    createLog({
      message: `Subscription cancelled for restaurant ${restaurant.name} - Restaurant is now closed and billing stopped`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Abonnement résilié. Le restaurant est maintenant fermé." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
