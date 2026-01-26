import express, { Application } from "express";

import "dotenv/config";
import cors from "cors";
import { corsOptions } from "./configuration/corsOptions.js";
import { router } from "./routes/router.js";

import { handleStripeWebhook } from "./controllers/stripeWebhookController.js";

// Create the Express application instance
export const app: Application = express();

// Stripe Webhook route - MUST be before express.json()
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

// Global middleware
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads

// Log each incoming request (method and path)
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Enable CORS with predefined options
app.use(cors(corsOptions));

// Register main application routes
app.use(router);

setInterval(
  async () => {
    try {
      const res = await fetch(process.env.SELF_URL + "/api/ping");
      console.log(`Self-ping status: ${res.status}`);
    } catch (err) {
      console.error("Self-ping failed:", err);
    }
  },
  14 * 60 * 1000,
);
