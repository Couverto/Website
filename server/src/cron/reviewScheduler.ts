import cron from "node-cron";
import { Booking } from "../models/bookingModel.js";
import { sendReviewRequestEmail } from "../services/emailService.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { Types } from "mongoose";

/**
 * Initializes the review request scheduler.
 * Runs every day at 8:00 AM.
 */
export const initReviewScheduler = () => {
  console.log("Initializing Review Request Scheduler 🕒");

  // Cron schedule: "0 8 * * *" -> 08:00 every day
  cron.schedule("0 8 * * *", async () => {
    console.log("Running scheduled Review Request Job...");

    try {
      // Calculate the start and end of yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      console.log(`Searching for bookings between ${startOfYesterday.toISOString()} and ${endOfYesterday.toISOString()}`);

      // Find bookings from yesterday that were confirmed and haven't received a review request
      const bookings = await Booking.find({
        bookingDate: {
          $gte: startOfYesterday,
          $lte: endOfYesterday,
        },
        status: bookingStatus.CONFIRMED,
        reviewRequestSent: { $ne: true },
        "customer.email": { $exists: true, $ne: "" },
      }).populate("restaurant");

      console.log(`Found ${bookings.length} bookings to send review requests to.`);

      for (const booking of bookings) {
        try {
          const restaurant = booking.restaurant as any; // Cast as IRestaurant if interface is available
          const reviewUrl = `${process.env.CORS_ORIGIN}/account/add-review?bookingId=${booking._id}`;

          await sendReviewRequestEmail(booking.customer.email!, booking.customer.name, restaurant.name, reviewUrl);

          // Mark as sent
          booking.reviewRequestSent = true;
          await booking.save();

          console.log(`Review request sent to ${booking.customer.email} for booking ${booking._id}`);
        } catch (error) {
          console.error(`Failed to send review request for booking ${booking._id}:`, error);
        }
      }

      console.log("Review Request Job completed.");
    } catch (error) {
      console.error("Error in Review Request Job:", error);
    }
  });
};
