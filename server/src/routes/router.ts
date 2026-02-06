import express, { Request, Response, Router } from "express";

import { userRouter } from "./usersRoutes.js";
import { authRouter } from "./authenticationRoutes.js";
import { configRouter } from "./configRoutes.js";
import { logRouter } from "./logsRoutes.js";
import { uploadRouter } from "./uploadRoutes.js";
import { restaurantRouter } from "./restaurantRoutes.js";
import { planRouter } from "./planRoutes.js";
import { bookingRouter } from "./bookingRoutes.js";
import { adminRouter } from "./adminRoutes.js";
import paymentRouter from "./paymentRoutes.js";
import { featureRouter } from "./featureRoutes.js";
import { reviewRoutes } from "./reviewRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const router: Router = express.Router();

// API routes
router.use("/api/users", userRouter); // User-related routes
router.use("/api/auth", authRouter); // Authentication routes
router.use("/api/logs", logRouter); // Logging routes
router.use("/api/config", configRouter); // Config routes
router.use("/api/restaurants", restaurantRouter); // Restaurant routes
router.use("/api/plans", planRouter); // Plan routes
router.use("/api/features", featureRouter); // Feature routes
router.use("/api/bookings", bookingRouter); // Booking routes
router.use("/api/reviews", reviewRoutes); // Review routes
router.use("/api/admin", adminRouter); // Admin routes
router.use("/api", paymentRouter); // Payment routes

// // UPLOADS routes
router.use("/api/uploads", uploadRouter); // File upload routes
router.use("/uploads", express.static(path.join(__dirname, "../../uploads"))); // Serve uploaded files

/**
 * @route GET /api/ping
 * @description Healthcheck to check if the server is running.
 * @access Public
 * @returns {object} Returns a JSON object with a message property indicating the server is running.
 */
router.get("/api/ping", (req: Request, res: Response) => {
  res.status(200).json({ message: "The server is running!" });
});

/**
 * @route ALL *
 * @description Handles all other routes and returns a 404 error if the route is not found.
 * @access Public
 * @returns {object} Returns a JSON object with an error property indicating the route was not found.
 */
router.use("/", (req: Request, res: Response) => {
  res.status(404).json({ error: `The requested route ${req.originalUrl} was not found` });
});
