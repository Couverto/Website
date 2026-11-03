import express, { Application, NextFunction, Request, Response } from "express";

import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { corsOptions } from "./configuration/corsOptions.js";
import { router } from "./routes/router.js";

import { handleStripeWebhook } from "./controllers/stripeWebhookController.js";
import { globalLimiter } from "./middlewares/rateLimiters.js";

// Create the Express application instance
export const app: Application = express();

// Number of reverse proxies in front of the API (needed to rate limit by real client IP).
// Set TRUST_PROXY=0 when the API is exposed directly, otherwise X-Forwarded-For could be spoofed.
app.set("trust proxy", parseInt(process.env.TRUST_PROXY ?? "1"));

// Security headers (uploaded files can be loaded by the front from another origin)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Stripe Webhook route - MUST be before express.json()
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use("/api", globalLimiter);

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

// Error handler: upload errors become 400s, anything else a generic 500 (no internal details sent)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Fichier trop volumineux (5 Mo maximum)" : "Fichier invalide";
    res.status(400).json({ error: message });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Requête invalide" });
    return;
  }
  if (err?.status === 400 && err?.expose) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});
