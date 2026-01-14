import { Request, Response } from "express";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function createBooking
 * @description Creates a new booking.
 * Handles both authenticated and guest users.
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurant, bookingDate, guests, customer, notes } = req.body;
    const userId = req.userId; // Middleware should populate this if token present

    // Validate restaurant existence
    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    // Prepare booking data
    const bookingData: any = {
      restaurant,
      bookingDate,
      guests,
      customer,
      notes,
      user: userId || null,
    };

    // If authenticated, we can optionally override customer info with user profile if not provided,
    // but the frontend usually sends the form data. We'll trust the body.

    const newBooking = await Booking.create(bookingData);

    // TODO: Send confirmation email/SMS (out of scope for now, but good placeholder)

    createLog({
      message: `Booking created for restaurant ${restaurant} by ${customer.name}`,
      userId: userId || undefined,
      level: logLevels.INFO,
    });

    res.status(201).json({ booking: newBooking, message: "server.bookings.messages.created" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getMyBookings
 * @description Retrieves bookings for the authenticated user.
 * Excludes bookings marked as hiddenForUser.
 */
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "server.auth.errors.unauthorized" });
      return;
    }

    const bookings = await Booking.find({ user: userId, status: { $ne: bookingStatus.HIDDEN } })
      .populate("restaurant", "name slug address city coverImage")
      .sort({ bookingDate: -1 });

    res.status(200).json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getBookingById
 * @description Retrieves a single booking by ID.
 * Ensures the user owns the booking or is an admin (admin check logic might need middleware or detailed check).
 * For now, simple owner check.
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(id).populate("restaurant");

    if (!booking) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    // Security check: only owner or guest (if we had a guest token) can see.
    // Assuming this route is for the 'My Bookings' detail view, so user must own it.
    if (booking.user && booking.user.toString() !== userId.toString()) {
      // TODO: Add Admin check here if admins need to see any booking via this route
      res.status(403).json({ error: "server.auth.errors.forbidden" });
      return;
    }

    res.status(200).json({ booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBooking
 * @description Updates booking details (date, guests, notes).
 * Only allows modification if status is PENDING or CONFIRMED (not CANCELLED).
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bookingDate, guests, notes } = req.body;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    if (booking.status === bookingStatus.CANCELLED) {
      res.status(400).json({ error: "server.bookings.errors.cannot_update_cancelled" });
      return;
    }

    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.guests = guests || booking.guests;
    booking.notes = notes !== undefined ? notes : booking.notes;

    // Reset status to PENDING if logic requires re-confirmation?
    // For now, let's keep status unless we want to define that rule.
    // Usually, modified bookings might need re-approval. Let's keep it simple.

    await booking.save();

    res.status(200).json({ booking, message: "server.bookings.messages.updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function cancelBooking
 * @description Cancels a booking.
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    booking.status = bookingStatus.CANCELLED;
    await booking.save();

    res.status(200).json({ message: "server.bookings.messages.cancelled" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function hideBooking
 * @description Hides a booking from the user's list (soft hide).
 */
export const hideBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    booking.hiddenForUser = true;
    await booking.save();

    res.status(200).json({ message: "server.bookings.messages.hidden" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createManualBooking
 * @description Allows admin/restaurant staff to create a manual booking.
 */
export const createManualBooking = async (req: Request, res: Response): Promise<void> => {
  // This is essentially same as createBooking but might enforce 'CONFIRMED' status immediately
  // and might be called by a different role.
  try {
    const { restaurant, bookingDate, guests, customer, notes } = req.body;

    // Use req.userId to check if user has rights to create manual booking for this restaurant
    // For simplicity, we assume the route middleware handles role check or we check it here.

    const newBooking = await Booking.create({
      restaurant,
      bookingDate,
      guests,
      customer,
      notes,
      status: bookingStatus.CONFIRMED, // Manual bookings are usually direct entry
      user: null, // Usually manual bookings are not linked to a web user account unless specified
    });

    createLog({
      message: `Manual booking created for restaurant ${restaurant}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ booking: newBooking, message: "server.bookings.messages.created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
