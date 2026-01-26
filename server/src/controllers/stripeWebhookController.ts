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
      const { transactionId, planId } = session.metadata || {};
      console.log(`[Stripe Webhook] Metadata: transactionId=${transactionId}, planId=${planId}`);

      try {
        const { PendingTransaction } = await import("../models/pendingTransactionModel.js");
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
            isClosed: true,
          });

          await restaurant.save();

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
    // Handle other event types if needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
