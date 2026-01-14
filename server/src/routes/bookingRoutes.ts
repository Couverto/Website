import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  hideBooking,
  createManualBooking,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const bookingRouter = express.Router();

/**
 * @route POST /api/bookings
 * @desc Create a new booking (public or auth)
 * @access Public
 */
bookingRouter.post("/", verifyToken(), createBooking);
bookingRouter.post("/guest", createBooking); // No middleware, controller handles null userId

/**
 * @route GET /api/bookings/my-bookings
 * @desc Get authenticated user's bookings
 * @access Private
 */
bookingRouter.get("/my-bookings", verifyToken(), getMyBookings);

/**
 * @route GET /api/bookings/:id
 * @desc Get a specific booking
 * @access Private
 */
bookingRouter.get("/:id", verifyToken(), getBookingById);

/**
 * @route PUT /api/bookings/:id
 * @desc Update a booking
 * @access Private
 */
bookingRouter.put("/:id", verifyToken(), updateBooking);

/**
 * @route PATCH /api/bookings/:id/cancel
 * @desc Cancel a booking
 * @access Private
 */
bookingRouter.patch("/:id/cancel", verifyToken(), cancelBooking);

/**
 * @route PATCH /api/bookings/:id/hide
 * @desc Hide a booking from user profile
 * @access Private
 */
bookingRouter.patch("/:id/hide", verifyToken(), hideBooking);

/**
 * @route POST /api/bookings/manual
 * @desc Create a manual booking (admin/staff)
 * @access Private (Admin/Pro)
 */
bookingRouter.post("/manual", verifyToken(), createManualBooking); // Middleware for role check should be added if needed
