import cron from "node-cron";
import { User } from "../models/userModel.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * Initializes the cleanup job for unverified users.
 * Runs every hour.
 */
export const initCleanupUnverifiedUsers = () => {
  console.log("Initializing Cleanup Unverified Users Scheduler 🧹");

  // Cron schedule: "0 * * * *" -> Every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled Cleanup Unverified Users Job...");

    try {
      // Calculate the cutoff time (24 hours ago)
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: cutoffTime },
      });

      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} unverified users created before ${cutoffTime.toISOString()}`);
        createLog({
          message: `Deleted ${result.deletedCount} unverified users created before ${cutoffTime.toISOString()}`,
          level: logLevels.INFO,
        });
      } else {
        console.log("No unverified users found to delete.");
      }

      console.log("Cleanup Unverified Users Job completed.");
    } catch (error) {
      console.error("Error in Cleanup Unverified Users Job:", error);
    }
  });
};
