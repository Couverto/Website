import { Request, Response } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { stripeService } from "../services/stripeService.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;

  try {
    // req.body must be raw for signature verification
    event = stripeService.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      console.log(`[Stripe Webhook] Session completed: ${session.id}`);
      const { transactionId, planId, referrerId } = session.metadata || {};
      console.log(`[Stripe Webhook] Metadata: transactionId=${transactionId}, planId=${planId}, referrerId=${referrerId}`);

      try {
        const { PendingTransaction } = await import("../models/pendingTransactionModel.js");
        const { ReferralCode } = await import("../models/referralCodeModel.js");
        const pending = await PendingTransaction.findById(transactionId);

        if (pending && pending.type === "RESTAURANT_CREATION") {
          // Retrieve actual subscription details to get the end date
          let subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Fallback
          if (session.subscription) {
            try {
              const subscription = await stripeService.retrieveSubscription(session.subscription);
              subscriptionEndDate = new Date((subscription as any).current_period_end * 1000);
              console.log(`[Stripe Webhook] Subscription period end: ${subscriptionEndDate.toISOString()}`);
            } catch (subError) {
              console.error("[Stripe Webhook] Error retrieving subscription:", subError);
            }
          }

          const restaurant = new Restaurant({
            ...pending.payload,
            subscriptionStatus: "active",
            plan: planId,
            subscriptionEndDate,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer, // Save the customer ID created during checkout
            isClosed: true,
          });

          await restaurant.save();

          // Handle referral linking
          const referredBy = pending.payload.referredBy;
          const referralCodeUsed = pending.payload.referralCodeUsed;

          console.log(`[Stripe Webhook] Referral data - referredBy: ${referredBy}, referralCodeUsed: ${referralCodeUsed}`);

          if (referredBy) {
            try {
              // Add new restaurant to referrer's referrals list
              await Restaurant.findByIdAndUpdate(referredBy, {
                $push: { referrals: restaurant._id },
              });
              console.log(`[Stripe Webhook] Added restaurant ${restaurant.name} to referrer's referrals`);

              createLog({
                message: `Restaurant '${restaurant.name}' linked to referrer (ID: ${referredBy})`,
                userId: pending.userId,
                level: logLevels.INFO,
              });
            } catch (refError) {
              console.error("[Stripe Webhook] Error handling referral linking:", refError);
            }
          }

          // Generate referral code for the new restaurant
          try {
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
            console.log(`[Stripe Webhook] Generated referral code ${newRefCode} for ${restaurant.name}`);
          } catch (codeError) {
            console.error("[Stripe Webhook] Error generating referral code:", codeError);
          }

          createLog({
            message: `Restaurant '${restaurant.name}' created and subscription activated after payment`,
            userId: pending.userId,
            level: logLevels.INFO,
          });

          // Delete the pending transaction after successful creation
          await PendingTransaction.findByIdAndDelete(transactionId);
        } else {
          console.error(`Pending transaction not found or invalid: ${transactionId}`);
        }
      } catch (error: any) {
        console.error("Error creating restaurant after payment", error);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;
      const customerId = invoice.customer;
      const amountPaid = invoice.amount_paid / 100; // Convert cents to units (Euros)

      console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}, amount: ${amountPaid}€`);

      if (!subscriptionId && !customerId) {
        console.error("[Stripe Webhook] Invoice has no subscription or customer ID");
        break;
      }

      try {
        const { Payment } = await import("../models/paymentModel.js");
        const { Plan } = await import("../models/planModel.js");

        // Find restaurant by subscription ID or customer ID
        const restaurant = await Restaurant.findOne({
          $or: [{ stripeSubscriptionId: subscriptionId }, { stripeCustomerId: customerId }],
        });

        if (!restaurant) {
          console.error(`[Stripe Webhook] Restaurant not found for subscription ${subscriptionId} or customer ${customerId}`);
          break;
        }

        // Determine plan from invoice line items
        let planId = restaurant.plan;
        let planName = "Unknown Plan";

        const lineItem = invoice.lines?.data?.find((line: any) => line.price?.id);
        if (lineItem?.price?.id) {
          const plan = await Plan.findOne({ stripePriceId: lineItem.price.id });
          if (plan) {
            planId = plan._id as any;
            planName = plan.name;
          }
        } else if (restaurant.plan) {
          // Fallback to current restaurant plan details if we can fetch them
          const currentPlan = await Plan.findById(restaurant.plan);
          if (currentPlan) {
            planName = currentPlan.name;
          }
        }

        // Create Payment Record only if amount > 0 (skip trial period invoices)
        if (amountPaid > 0) {
          await Payment.create({
            restaurant: restaurant._id,
            plan: planId,
            planName: planName,
            amount: amountPaid,
            status: "completed",
            paymentMethod: "card",
          });
        } else {
          console.log(`[Stripe Webhook] Skipping payment record for 0€ trial invoice`);
        }

        // Update Restaurant Subscription Validity
        if (invoice.lines?.data?.[0]?.period?.end) {
          const newEndDate = new Date(invoice.lines.data[0].period.end * 1000);
          restaurant.subscriptionEndDate = newEndDate;
          restaurant.subscriptionStatus = "active";
          restaurant.isClosed = false; // Ensure restaurant is open if paid

          // Also update plan reference if changed via invoice
          if (planId && String(restaurant.plan) !== String(planId)) {
            restaurant.plan = planId;
          }

          await restaurant.save();
          console.log(`[Stripe Webhook] Updated restaurant ${restaurant.name} subscription to end ${newEndDate.toISOString()}`);
        }

        createLog({
          message: `Invoice paid (${amountPaid}€) for restaurant ${restaurant.name} - Subscription verified`,
          userId: (restaurant.collaborators?.[0] as any) || restaurant._id, // Assign to owner or self
          level: logLevels.INFO,
        });
      } catch (error: any) {
        console.error("[Stripe Webhook] Error processing invoice payment:", error);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
