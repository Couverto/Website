import cron from "node-cron";
import { Restaurant } from "../models/restaurantModel.js";
import { stripeService } from "../services/stripeService.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { Constants } from "../constants/constants.js";
import { sendEmail } from "../utils/sendEmail.js";
import { baseEmailLayout } from "../templates/baseEmail.js";
import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * @function expireUnpaidSubscriptions
 * @description Closes paid restaurants whose subscription period ended more than SUBSCRIPTION_GRACE_DAYS ago
 * without a renewal (failed payments, cancelled subscription). Free plans and sponsor restaurants
 * (no end date) are never affected. Before closing, the Stripe subscription is checked so that a missed
 * "invoice.payment_succeeded" webhook cannot close a restaurant that actually paid.
 * @returns {Promise<number>} Number of restaurants closed.
 */
export const expireUnpaidSubscriptions = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - Constants.SUBSCRIPTION_GRACE_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await Restaurant.find({
    subscriptionEndDate: { $ne: null, $lt: cutoff },
    subscriptionStatus: { $in: ["active", "cancelled"] },
  }).populate<{ plan: { price: number; name: string } | null }>("plan", "price name");

  let closedCount = 0;

  for (const restaurant of candidates) {
    try {
      if (!restaurant.plan || restaurant.plan.price <= 0) continue;

      // Safety net: trust Stripe over our stored end date
      if (restaurant.stripeSubscriptionId) {
        try {
          const subscription: any = await stripeService.retrieveSubscription(restaurant.stripeSubscriptionId);
          if (["active", "trialing"].includes(subscription.status)) {
            restaurant.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
            await restaurant.save();
            continue;
          }
        } catch (stripeErr) {
          console.error(`[SubscriptionExpiry] Could not check Stripe subscription for ${restaurant._id}`, stripeErr);
          continue; // Do not close a restaurant on a Stripe outage
        }
      }

      restaurant.subscriptionStatus = "expired";
      restaurant.isClosed = true;
      await restaurant.save();
      closedCount++;

      createLog({
        message: `Restaurant '${restaurant.name}' closed: subscription unpaid for more than ${Constants.SUBSCRIPTION_GRACE_DAYS} days`,
        level: logLevels.WARN,
      });

      if (restaurant.email) {
        try {
          await sendEmail({
            email: restaurant.email,
            subject: `Votre restaurant ${restaurant.name} a été fermé - Couverto`,
            message: baseEmailLayout(
              `<h2>Votre abonnement a expiré</h2>
              <p>Le paiement de l'abonnement de <strong>${escapeHtml(restaurant.name)}</strong> n'a pas été reçu
              ${Constants.SUBSCRIPTION_GRACE_DAYS} jours après la fin de votre période. Votre restaurant a donc été fermé
              et n'accepte plus de réservations.</p>
              <p>Renouvelez votre abonnement depuis la page <strong>Abonnement</strong> de votre espace pour le rouvrir.</p>`,
              "Abonnement expiré",
            ),
          });
        } catch (mailErr) {
          console.error(`[SubscriptionExpiry] Email failed for ${restaurant._id}`, mailErr);
        }
      }
    } catch (err) {
      console.error(`[SubscriptionExpiry] Failed to process restaurant ${restaurant._id}`, err);
    }
  }

  return closedCount;
};

/**
 * Initializes the subscription expiry job.
 * Runs once per day at 4:00 AM.
 */
export const initSubscriptionExpiry = () => {
  console.log("Initializing Subscription Expiry Scheduler 💳");

  cron.schedule("0 4 * * *", async () => {
    try {
      const closed = await expireUnpaidSubscriptions();
      console.log(`Subscription Expiry Job completed: ${closed} restaurant(s) closed.`);
    } catch (error) {
      console.error("Error in Subscription Expiry Job:", error);
    }
  });
};
