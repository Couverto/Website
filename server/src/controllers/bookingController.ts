import { Request, Response } from "express";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { getIO } from "../sockets/socket.js";

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
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { phone: customer.phone });
      } catch (userUpdateErr) {
        console.error("Failed to update user phone during booking", userUpdateErr);
      }
    }

    // Check for auto-confirmation based on capacity
    // Default status is PENDING
    // logic: if capacity is set (>0) and (current bookings count + new guests) <= capacity, then CONFIRMED

    if (restaurantExists.capacity && restaurantExists.capacity > 0) {
      const bookingTime = new Date(bookingDate).getTime();
      // Assume 2 hours meal duration for overlap check
      // Check bookings that overlap with [bookingTime, bookingTime + 2h]
      // Valid overlap: existing.start < new.end && existing.end > new.start
      // For simplicity, we check bookings within +/- 2 hours range

      const twoHours = 2 * 60 * 60 * 1000;
      const startTime = new Date(bookingTime - twoHours);
      const endTime = new Date(bookingTime + twoHours);

      const existingBookings = await Booking.find({
        restaurant: restaurant,
        bookingDate: { $gte: startTime, $lte: endTime },
        status: { $in: [bookingStatus.CONFIRMED, bookingStatus.PENDING] },
      });

      // Filter deeper if needed for precise overlap, but 2h window query is a decent approximation
      // Let's do precise overlap check if we consider fixed 2h slots logic implicit
      // New booking interval: [T, T+2h]
      // Existing booking interval: [Tb, Tb+2h]
      // Overlap if: Tb < T+2h && Tb+2h > T

      const newStart = bookingTime;
      const newEnd = bookingTime + twoHours;

      let currentHeadCount = 0;

      for (const booking of existingBookings) {
        const bStart = new Date(booking.bookingDate).getTime();
        const bEnd = bStart + twoHours;

        if (bStart < newEnd && bEnd > newStart) {
          currentHeadCount += booking.guests;
        }
      }

      if (currentHeadCount + Number(guests) <= restaurantExists.capacity) {
        bookingData.status = bookingStatus.CONFIRMED;
      }
    }

    const newBooking = await Booking.create(bookingData);

    // Emit real-time event to restaurant room
    try {
      // Need to populate customer name if it's from user profile, but created booking has it in customer object
      // If we used userId, we might want to populate. But here we have customer object in body.
      // But let's check what socket needs. The frontend usage will need consistent data.
      // The booking object created has customer data.
      getIO().to(`restaurant_${restaurant}`).emit("newBooking", newBooking);
    } catch (error) {
      console.error("Socket emit failed", error);
    }

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
 * @description Retrieves bookings for the authenticated user with pagination and filters.
 * @query page - Page number (0-indexed)
 * @query size - Page size (default 10)
 * @query status - Filter by booking status (PENDING, CONFIRMED, CANCELLED)
 * @query search - Search by restaurant name
 */
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "server.auth.errors.unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query
    const query: any = { user: userId };

    // Filter by status if provided
    if (status && Object.values(bookingStatus).includes(status as bookingStatus)) {
      query.status = status;
    }

    // Get bookings with population
    let bookingsQuery = Booking.find(query).populate("restaurant", "name slug address city coverImage").sort({ bookingDate: -1 });

    // If search is provided, we need to filter after population
    let bookings = await bookingsQuery;
    let totalCount = bookings.length;

    // Filter by restaurant name if search is provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      bookings = bookings.filter((booking: any) => booking.restaurant?.name?.toLowerCase().includes(searchLower));
      totalCount = bookings.length;
    }

    // Apply pagination
    const skip = page * size;
    const paginatedBookings = bookings.slice(skip, skip + size);

    res.status(200).json({
      bookings: paginatedBookings,
      count: totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    });
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

    // Check if booking date is in the past
    if (new Date(booking.bookingDate) < new Date()) {
      res.status(400).json({ error: "server.bookings.errors.cannot_update_past" });
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

/**
 * @function getRestaurantBookings
 * @description Retrieves all bookings for a restaurant (for collaborators).
 */
export const getRestaurantBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    const query: any = { restaurant: id };

    // Filter by status
    if (status && Object.values(bookingStatus).includes(status as bookingStatus)) {
      query.status = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.bookingDate = {};
      if (dateFrom) query.bookingDate.$gte = new Date(dateFrom);
      if (dateTo) query.bookingDate.$lte = new Date(dateTo);
    }

    // Search by customer name or phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ "customer.name": searchRegex }, { "customer.phone": searchRegex }, { "customer.email": searchRegex }];
    }

    const bookings = await Booking.find(query)
      .populate("user", "name forename email avatar")
      .sort({ bookingDate: -1 })
      .skip(page * size)
      .limit(size);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      bookings,
      count,
      page,
      size,
      totalPages: Math.ceil(count / size),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 20;
    const search = req.query.search as string;

    const mongoose = await import("mongoose");
    const restaurantId = mongoose.Types.ObjectId.createFromHexString(id);

    const matchStage: any = { restaurant: restaurantId };

    // Grouping by user if available, otherwise by phone
    const clientsAggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ["$user", "$customer.phone"] },
          userId: { $first: "$user" },
          name: { $first: "$customer.name" },
          email: { $first: "$customer.email" },
          phone: { $first: "$customer.phone" },
          totalBookings: { $sum: 1 },
          totalGuests: { $sum: "$guests" },
          lastVisit: { $max: "$bookingDate" },
          firstVisit: { $min: "$bookingDate" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          phone: 1,
          totalBookings: 1,
          totalGuests: 1,
          lastVisit: 1,
          firstVisit: 1,
          name: { $ifNull: ["$userDetails.fullname", "$name"] },
          email: { $ifNull: ["$userDetails.email", "$email"] },
          avatar: "$userDetails.avatar",
          isRegistered: { $cond: [{ $ifNull: ["$userId", false] }, true, false] },
        },
      },
      // Search filter after projection/join
      ...(search && search.trim()
        ? [
            {
              $match: {
                $or: [
                  { name: new RegExp(search.trim(), "i") },
                  { phone: new RegExp(search.trim(), "i") },
                  { email: new RegExp(search.trim(), "i") },
                ],
              },
            },
          ]
        : []),
      { $sort: { lastVisit: -1 } },
      { $skip: page * size },
      { $limit: size },
    ]);

    // Count unique clients
    const countAggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ["$user", "$customer.phone"] },
        },
      },
      { $count: "total" },
    ]);

    res.status(200).json({
      clients: clientsAggregation,
      count: countAggregation[0]?.total || 0,
      page,
      size,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateBookingStatus
 * @description Updates a booking status (for restaurant collaborators).
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, bookingId } = req.params;
    const { status } = req.body;

    if (!Object.values(bookingStatus).includes(status)) {
      res.status(400).json({ error: "server.bookings.errors.invalid_status" });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, restaurant: id });

    if (!booking) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    booking.status = status;
    await booking.save();

    createLog({
      message: `Booking status updated to ${status}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ booking, message: "server.bookings.messages.updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
