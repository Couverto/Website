import { Request, Response } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { PendingTransaction } from "../models/pendingTransactionModel.js";
import { Payment } from "../models/paymentModel.js";
import { Plan } from "../models/planModel.js";
import { stripeService } from "../services/stripeService.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function finalizePayment
 * @description Fallback endpoint to complete restaurant creation after Stripe payment.
 * Used when webhook doesn't fire (e.g., local development without Stripe CLI).
 */
export const finalizePayment = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: "Session ID manquant" });
    return;
  }

  try {
    // Verify the session with Stripe
    const session = await stripeService.retrieveSession(sessionId);

    if (session.payment_status !== "paid") {
      res.status(400).json({ error: "Le paiement n'est pas confirmé" });
      return;
    }

    const { transactionId, planId, restaurantId, type } = (session.metadata as any) || {};

    // Handle RESUBSCRIPTION for existing restaurants
    if (type === "RESUBSCRIPTION" && restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ error: "Restaurant introuvable" });
        return;
      }

      // Check if already processed (has active subscription now)
      if (restaurant.stripeSubscriptionId === session.subscription) {
        res.status(200).json({ message: "Abonnement déjà activé", alreadyProcessed: true });
        return;
      }

      const plan = await Plan.findById(planId);
      if (!plan) {
        res.status(400).json({ error: "Plan introuvable" });
        return;
      }

      // Get subscription details
      let subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      if (session.subscription) {
        try {
          const subscription = await stripeService.retrieveSubscription(session.subscription as string);
          subscriptionEndDate = new Date((subscription as any).current_period_end * 1000);
        } catch (subError) {
          console.error("[Finalize] Error retrieving subscription:", subError);
        }
      }

      // Update restaurant with new subscription
      restaurant.plan = plan._id as any;
      restaurant.subscriptionStatus = "active";
      restaurant.subscriptionEndDate = subscriptionEndDate;
      restaurant.stripeSubscriptionId = session.subscription as string;
      restaurant.autoRenew = true;
      // Note: Restaurant stays closed - user must manually open it

      await restaurant.save();

      // Record payment
      await Payment.create({
        restaurant: restaurant._id,
        plan: plan._id,
        planName: plan.name,
        amount: plan.price,
        status: "completed",
        paymentMethod: "card",
      });

      createLog({
        message: `Restaurant '${restaurant.name}' resubscribed via Stripe checkout`,
        userId: req.userId,
        level: logLevels.INFO,
      });

      res.status(200).json({ restaurant, message: "Abonnement activé avec succès" });
      return;
    }

    // Handle RESTAURANT_CREATION (original flow)
    if (!transactionId) {
      res.status(400).json({ error: "Transaction introuvable dans les métadonnées" });
      return;
    }

    // Check if already processed
    const pending = await PendingTransaction.findById(transactionId);

    if (!pending) {
      console.log(`[Finalize] Pending Transaction not found or already deleted: ${transactionId}`);
      // Already processed by webhook or doesn't exist
      res.status(200).json({
        message: "Restaurant déjà créé",
        alreadyProcessed: true,
      });
      return;
    }

    if (pending.type !== "RESTAURANT_CREATION") {
      res.status(400).json({ error: "Type de transaction invalide" });
      return;
    }

    // Fetch the plan for payment record
    const planIdToUse = planId || pending.payload.plan;
    console.log(`[Finalize] Using planId: ${planIdToUse} (Meta: ${planId}, Pending: ${pending.payload.plan})`);

    const plan = await Plan.findById(planIdToUse);
    if (!plan) {
      console.error(`[Finalize] Plan not found: ${planIdToUse}`);
      res.status(400).json({ error: "Plan introuvable" });
      return;
    }

    // Get subscription details for accurate end date
    let subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (session.subscription) {
      try {
        const subscription = await stripeService.retrieveSubscription(session.subscription as string);
        subscriptionEndDate = new Date((subscription as any).current_period_end * 1000);
      } catch (subError) {
        console.error("[Finalize] Error retrieving subscription:", subError);
      }
    }

    // Create the restaurant
    console.log(`[Finalize] Creating restaurant object...`);
    const restaurant = new Restaurant({
      ...pending.payload,
      subscriptionStatus: "active",
      plan: plan._id,
      subscriptionEndDate,
      stripeSubscriptionId: session.subscription,
      isClosed: true,
    });

    await restaurant.save();
    console.log(`[Finalize] Restaurant created and saved: ${restaurant._id}`);

    // Handle referral linking if restaurant was referred
    const referredBy = pending.payload.referredBy;
    if (referredBy) {
      console.log(`[Finalize] Restaurant referred by: ${referredBy}`);
      // The referredBy is already saved in the restaurant via pending.payload
      // We just need to log it for debugging
    }

    // Generate referral code for the new restaurant
    try {
      const { ReferralCode } = await import("../models/referralCodeModel.js");
      const newRefCode = await (ReferralCode as any).generateUniqueCode();
      const refCodeDoc = new ReferralCode({
        code: newRefCode,
        restaurantId: restaurant._id,
        isActive: true,
        discountPercentage: 10,
      });
      await refCodeDoc.save();
      restaurant.referralCode = refCodeDoc._id as any;
      await restaurant.save();
      console.log(`[Finalize] Generated referral code ${newRefCode} for ${restaurant.name}`);
    } catch (codeError) {
      console.error("[Finalize] Error generating referral code:", codeError);
    }

    // Check if subscription has a trial period (don't create payment record for trials)
    let isTrialPeriod = false;
    if (session.subscription) {
      try {
        const subscription = await stripeService.retrieveSubscription(session.subscription as string);
        isTrialPeriod = (subscription as any).status === "trialing";
        console.log(`[Finalize] Subscription status: ${(subscription as any).status}, isTrialing: ${isTrialPeriod}`);
      } catch (subError) {
        console.error("[Finalize] Error checking subscription status:", subError);
      }
    }

    // Create payment record only if not in trial period
    if (!isTrialPeriod) {
      await Payment.create({
        restaurant: restaurant._id,
        plan: plan._id,
        planName: plan.name,
        amount: plan.price,
        status: "completed",
        paymentMethod: "card",
      });
    } else {
      console.log(`[Finalize] Skipping payment record - restaurant is in trial period`);
    }

    createLog({
      message: `Restaurant '${restaurant.name}' created via manual finalization after payment${isTrialPeriod ? " (trial period)" : ""}`,
      userId: pending.userId,
      level: logLevels.INFO,
    });

    // Delete the pending transaction
    await PendingTransaction.findByIdAndDelete(transactionId);
    console.log(`[Finalize] Pending Transaction deleted: ${transactionId}`);

    res.status(201).json({
      restaurant,
      message: "Restaurant créé avec succès",
    });
  } catch (err: any) {
    console.error("[Finalize] Error:", err);
    res.status(500).json({ error: err.message });
  }
};
