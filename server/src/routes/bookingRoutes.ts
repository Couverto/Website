import express from "express";
import {
  createBooking,
  createSetupIntent,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  createManualBooking,
  getRestaurantBookings,
  getRestaurantClients,
  updateBookingStatus,
  dismissBooking,
  updateBookingTable,
  captureBankImprint,
  releaseBankImprint,
} from "../controllers/bookingController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";

export const bookingRouter = express.Router();

/**
 * @route POST /api/bookings/setup-intent
 * @desc Create a SetupIntent for a Bank Imprint
 * @access Public
 */
bookingRouter.post("/setup-intent", createSetupIntent);

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

/**
 * @route PATCH /api/bookings/restaurant/:id/:bookingId/dismiss
 * @desc Dismiss a booking from the dashboard (archive)
 * @access Private (Collaborator)
 */
bookingRouter.patch(
  "/restaurant/:id/:bookingId/dismiss",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  dismissBooking,
);

/**
 * @route PATCH /api/bookings/restaurant/:id/:bookingId/table
 * @desc Update a booking table
 * @access Private (Collaborator)
 */
bookingRouter.patch(
  "/restaurant/:id/:bookingId/table",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  updateBookingTable,
);

/**
 * @route POST /api/bookings/restaurant/:id/:bookingId/capture-imprint
 * @desc Capture a bank imprint
 * @access Private (Collaborator)
 */
bookingRouter.post(
  "/restaurant/:id/:bookingId/capture-imprint",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  captureBankImprint,
);

/**
 * @route POST /api/bookings/restaurant/:id/:bookingId/release-imprint
 * @desc Release a bank imprint
 * @access Private (Collaborator)
 */
bookingRouter.post(
  "/restaurant/:id/:bookingId/release-imprint",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  releaseBankImprint,
);
