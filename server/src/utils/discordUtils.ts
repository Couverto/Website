import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * Sends a notification message to a Discord webhook.
 * @param message - The message to send to Discord.
 */
export const sendDiscordNotification = async (message: string): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not defined in the environment variables.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send Discord notification: ${response.status} ${response.statusText}`, errorText);
    }
  } catch (err: any) {
    console.error("Error sending Discord notification:", err.message);
  }
};
