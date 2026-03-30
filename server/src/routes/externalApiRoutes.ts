import express from "express";
import { createExternalBooking } from "../controllers/externalBookingController.js";
import { verifyApiKey } from "../middlewares/verifyApiKey.js";

export const externalApiRouter = express.Router();

/**
 * @route POST /api/external/bookings
 * @desc Create a booking via the external API (restaurant integration)
 * @access Protected (API Key)
 * @headers X-API-Key, X-Restaurant-Id
 */
externalApiRouter.post("/bookings", verifyApiKey, createExternalBooking);
