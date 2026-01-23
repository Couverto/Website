import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Booking } from "../models/bookingModel.js";
import { Log } from "../models/logModel.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { createLog } from "./logController.js";

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers,
      totalRestaurants,
      newRestaurants,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalLogs,
      errorLogs24h,
      totalGuestsAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ createdAt: { $gte: last7Days } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: bookingStatus.PENDING }),
      Booking.countDocuments({ status: bookingStatus.CONFIRMED }),
      Booking.countDocuments({ status: bookingStatus.CANCELLED }),
      Log.countDocuments(),
      Log.countDocuments({
        level: logLevels.ERROR,
        createdAt: { $gte: last24Hours },
      }),
      Booking.aggregate([{ $group: { _id: null, totalGuests: { $sum: "$guests" } } }]),
    ]);

    const totalGuests = totalGuestsAgg[0]?.totalGuests || 0;

    createLog({
      message: `Admin dashboard statistics accessed`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      users: {
        total: totalUsers,
        newLast7Days: newUsers,
      },
      restaurants: {
        total: totalRestaurants,
        newLast7Days: newRestaurants,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        totalGuests,
      },
      system: {
        totalLogs,
        errorLogsLast24h: errorLogs24h,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
