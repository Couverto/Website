import express, { Router } from "express";
import { getAdminStats } from "../controllers/dashboardController.js";

import { getPayments } from "../controllers/paymentController.js";
import {
  getAdminBookings,
  deleteBookingAdmin,
  updateBookingNoteAdmin,
  sendBookingEmailAdmin,
  cancelBookingAdmin,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const adminRouter: Router = express.Router();

/**
 * @route GET /stats
 * @description Retrieves global statistics for the admin dashboard.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is an admin.
 */
adminRouter.get("/stats", verifyToken({ role: userRoles.ADMIN }), getAdminStats);

/**
 * @route GET /payments
 * @description Retrieves all payments for the admin dashboard.
 */
adminRouter.get("/payments", verifyToken({ role: userRoles.ADMIN }), getPayments);

/**
 * @route GET /bookings
 * @description Retrieves all bookings for the admin dashboard.
 */
adminRouter.get("/bookings", verifyToken({ role: userRoles.ADMIN }), getAdminBookings);

/**
 * @route DELETE /bookings/:id
 * @description Deletes a booking from the database (admin only).
 */
adminRouter.delete("/bookings/:id", verifyToken({ role: userRoles.ADMIN }), deleteBookingAdmin);

/**
 * @route PATCH /bookings/:id/note
 * @description Updates the note for a booking (admin only).
 */
adminRouter.patch("/bookings/:id/note", verifyToken({ role: userRoles.ADMIN }), updateBookingNoteAdmin);

/**
 * @route POST /bookings/:id/email
 * @description Resends a booking email to the client (admin only).
 */
adminRouter.post("/bookings/:id/email", verifyToken({ role: userRoles.ADMIN }), sendBookingEmailAdmin);

/**
 * @route PATCH /bookings/:id/cancel
 * @description Cancels a booking and sends an email (admin only).
 */
adminRouter.patch("/bookings/:id/cancel", verifyToken({ role: userRoles.ADMIN }), cancelBookingAdmin);
