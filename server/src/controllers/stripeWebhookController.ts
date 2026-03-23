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
        const { Plan } = await import("../models/planModel.js");

        // Handle RESUBSCRIPTION metadata (sent for existing restaurants changing plans)
        const { type, restaurantId } = session.metadata || {};

        if (type === "RESUBSCRIPTION" && restaurantId) {
          console.log(`[Stripe Webhook] Handling RESUBSCRIPTION for restaurant: ${restaurantId}`);
          const restaurant = await Restaurant.findById(restaurantId);
          if (restaurant) {
            restaurant.stripeSubscriptionId = session.subscription;
            restaurant.stripeCustomerId = session.customer;
            restaurant.subscriptionStatus = "active";
            if (planId) restaurant.plan = planId;

            // Update end date if possible
            if (session.subscription) {
              try {
                const subscription = await stripeService.retrieveSubscription(session.subscription);
                restaurant.subscriptionEndDate = new Date((subscription as any).current_period_end * 1000);
              } catch (subError) {
                console.error("[Stripe Webhook] Error retrieving subscription info for resubscription:", subError);
              }
            }

            await restaurant.save();
            console.log(`[Stripe Webhook] Restaurant ${restaurant.name} resubscription updated`);

            createLog({
              message: `Restaurant '${restaurant.name}' resubscribed/changed plan - Subscription updated`,
              userId: (restaurant.collaborators?.[0] as any) || restaurant._id,
              level: logLevels.INFO,
            });
          } else {
            console.error(`[Stripe Webhook] RESUBSCRIPTION: Restaurant not found: ${restaurantId}`);
          }
          break; // Done with this event
        }

        // Atomically find and delete to prevent race conditions
        const pending = await PendingTransaction.findByIdAndDelete(transactionId);

        if (pending && pending.type === "RESTAURANT_CREATION") {
          console.log(`[Stripe Webhook] Found pending transaction: ${pending._id}`);
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
            plan: planId || pending.payload.plan,
            subscriptionEndDate,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer, // Save the customer ID created during checkout
            isClosed: true,
          });

          await restaurant.save();
          console.log(`[Stripe Webhook] Restaurant created from pending transaction: ${restaurant._id}`);

          // Handle referral linking
          const referredBy = pending.payload.referredBy;

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

          // The pending transaction was already deleted at the beginning of this block
          console.log(`[Stripe Webhook] Successfully processed transaction: ${transactionId}`);
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

        // Find restaurant by subscription ID first (most specific), then customer ID, then email
        let restaurant = null;

        // 1. Try matching by subscriptionId (unique per subscription, most reliable)
        if (subscriptionId) {
          restaurant = await Restaurant.findOne({ stripeSubscriptionId: subscriptionId });
          if (restaurant) {
            console.log(`[Stripe Webhook] Matched restaurant '${restaurant.name}' by subscriptionId: ${subscriptionId}`);
          }
        }

        // 2. Fallback: match by customerId (less specific — a customer can have multiple subscriptions)
        if (!restaurant && customerId) {
          restaurant = await Restaurant.findOne({ stripeCustomerId: customerId });
          if (restaurant) {
            console.log(`[Stripe Webhook] Matched restaurant '${restaurant.name}' by customerId: ${customerId}`);
          }
        }

        // 3. Last resort: match by customer email
        if (!restaurant && customerId) {
          console.warn(`[Stripe Webhook] Restaurant not found by IDs, searching by customer email for customer ${customerId}`);
          try {
            const stripeCustomer = await stripeService.retrieveCustomer(customerId);
            if ((stripeCustomer as any).email) {
              restaurant = await Restaurant.findOne({ email: (stripeCustomer as any).email });
              if (restaurant) {
                console.log(`[Stripe Webhook] Matched restaurant '${restaurant.name}' by email: ${(stripeCustomer as any).email}`);
              }
            }
          } catch (custErr) {
            console.error("[Stripe Webhook] Failed to retrieve customer email fallback:", custErr);
          }
        }

        if (!restaurant) {
          console.error(`[Stripe Webhook] Restaurant not found for subscription ${subscriptionId} or customer ${customerId}`);
          break;
        }

        // SYNC: Ensure the restaurant has the correct subscription/customer IDs saved
        let needsSave = false;
        if (subscriptionId && restaurant.stripeSubscriptionId !== subscriptionId) {
          restaurant.stripeSubscriptionId = subscriptionId;
          needsSave = true;
        }
        if (customerId && restaurant.stripeCustomerId !== customerId) {
          restaurant.stripeCustomerId = customerId;
          needsSave = true;
        }
        if (needsSave) {
          await restaurant.save();
          console.log(`[Stripe Webhook] Synchronized Stripe IDs for restaurant ${restaurant.name}`);
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
    case "account.updated": {
      const account = event.data.object as any;
      console.log(`[Stripe Webhook] Connect Account updated: ${account.id}`);

      // Check if onboarding is complete
      if (account.charges_enabled && account.details_submitted) {
        try {
          const restaurant = await Restaurant.findOne({ stripeAccountId: account.id });
          if (restaurant && !restaurant.stripeConnectEnabled) {
            restaurant.stripeConnectEnabled = true;
            await restaurant.save();
            console.log(`[Stripe Webhook] Restaurant ${restaurant.name} fully onboarded to Stripe Connect`);

            createLog({
              message: `Restaurant '${restaurant.name}' a terminé son intégration Stripe Connect`,
              userId: (restaurant.collaborators?.[0] as any) || restaurant._id,
              level: logLevels.INFO,
            });
          }
        } catch (error) {
          console.error("[Stripe Webhook] Error updating restaurant Connect status:", error);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      createLog({
        message: `Unhandled stripe event type ${event.type}`,
        level: logLevels.INFO,
      });
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
