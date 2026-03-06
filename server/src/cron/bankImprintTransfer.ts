import cron from "node-cron";
import mongoose from "mongoose";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { stripeService } from "../services/stripeService.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * Initializes the daily bank imprint transfer job.
 * Runs every day at 02:00 AM.
 */
export const initBankImprintTransfer = () => {
  console.log("Initializing Bank Imprint Transfer Scheduler 💸");

  cron.schedule("0 2 * * *", async () => {
    console.log("[Cron] Running daily bank imprint transfers...");

    try {
      // Find captured bookings that haven't been transferred
      const bookings = await Booking.find({
        bankImprintStatus: "captured",
        bankImprintTransferred: false,
      }).populate<{ restaurant: any }>("restaurant");

      if (bookings.length === 0) {
        console.log("[Cron] No pending bank imprint transfers.");
        return;
      }

      for (const booking of bookings) {
        const restaurant = booking.restaurant;

        if (!restaurant || !restaurant.stripeAccountId || !restaurant.stripeConnectEnabled) {
          console.warn(`[Cron] Booking ${booking._id}: Restaurant not fully onboarded to Stripe Connect. Transfer skipped.`);
          continue;
        }

        const amount = booking.bankImprintAmount;
        if (!amount || amount <= 0) {
          console.warn(`[Cron] Booking ${booking._id}: Invalid bank imprint amount.`);
          continue;
        }

        try {
          // Transfer 100% of the funds
          await stripeService.createTransfer(amount, restaurant.stripeAccountId, {
            bookingId: booking._id.toString(),
            restaurantId: restaurant._id.toString(),
          });

          // Mark as transferred
          booking.bankImprintTransferred = true;
          await booking.save();

          console.log(`[Cron] Transferred ${amount}€ for booking ${booking._id} to account ${restaurant.stripeAccountId}`);

          createLog({
            message: `[Cron] Empreinte bancaire de ${amount}€ (Réservation: ${booking._id}) transférée au compte Stripe du restaurant.`,
            userId: restaurant.collaborators?.[0] || restaurant._id,
            level: logLevels.INFO,
          });
        } catch (transferError: any) {
          console.error(`[Cron] Failed to transfer amount for booking ${booking._id}:`, transferError.message);
        }
      }

      console.log("[Cron] Bank imprint transfers completed.");
    } catch (error) {
      console.error("[Cron] Error during bank imprint transfers:", error);
    }
  });
};
