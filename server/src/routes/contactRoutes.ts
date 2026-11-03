import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";
import { contactLimiter } from "../middlewares/rateLimiters.js";

export const contactRouter = express.Router();

/**
 * @route POST /api/contact
 * @description Send a contact message
 * @access Public
 */
contactRouter.post("/", contactLimiter, sendContactMessage);
