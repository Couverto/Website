import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  createManualBooking,
  getRestaurantBookings,
  getRestaurantClients,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";

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
 * @route POST /api/bookings/manual
 * @desc Create a manual booking (admin/staff)
 * @access Private (Admin/Pro)
 */
bookingRouter.post("/manual", verifyToken(), createManualBooking);

import { restaurantRoles } from "../utils/enums/restaurantRoles.js";

// =====================
// Restaurant Collaborator Routes
// =====================

/**
 * @route GET /api/bookings/restaurant/:id
 * @desc Get all bookings for a restaurant
 * @access Private (Collaborator)
 */
bookingRouter.get(
  "/restaurant/:id",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  getRestaurantBookings,
);

/**
 * @route GET /api/bookings/restaurant/:id/clients
 * @desc Get all unique clients for a restaurant
 * @access Private (Collaborator)
 */
bookingRouter.get(
  "/restaurant/:id/clients",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  getRestaurantClients,
);

/**
 * @route PATCH /api/bookings/restaurant/:id/:bookingId/status
 * @desc Update a booking status
 * @access Private (Collaborator)
 */
bookingRouter.patch(
  "/restaurant/:id/:bookingId/status",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  updateBookingStatus,
);
