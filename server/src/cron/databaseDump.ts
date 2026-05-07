import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Initializes the DB backup scheduler
 * Runs every day at 2:00 AM
 */
export const initDatabaseBackupScheduler = () => {
  console.log("Initializing DB backup scheduler 🕒");

  cron.schedule("0 2 * * *", async () => {
    try {
      const backupDir = path.join(process.cwd(), "backups");

      // Create backups folder if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const date = new Date().toISOString().split("T")[0];
      const backupPath = path.join(backupDir, `backup-${date}.gz`);

      const mongoUri = process.env.MONG_URI;

      if (!mongoUri) {
        throw new Error("MONGO_URI is missing");
      }

      console.log(`Starting DB backup -> ${backupPath}`);

      const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Backup failed:", error);
          return;
        }

        if (stderr) {
          console.error("Backup stderr:", stderr);
        }

        // If there are more than 7 files, delete the oldest one
        const files = fs
          .readdirSync(backupDir)
          .filter((file) => file.endsWith(".gz"))
          .map((file) => ({
            name: file,
            time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
          }))
          .sort((a, b) => b.time - a.time);

        // If there are more than 7 files, delete the oldest ones
        if (files.length > 7) {
          const filesToDelete = files.slice(7);

          for (const file of filesToDelete) {
            const filePath = path.join(backupDir, file.name);

            fs.unlinkSync(filePath);

            console.log(`Deleted old backup: ${file.name}`);
          }
        }

        console.log("Database backup completed ✅");
        console.log(stdout);
      });
    } catch (error) {
      console.error("Error in DB backup job:", error);
    }
  });
};
