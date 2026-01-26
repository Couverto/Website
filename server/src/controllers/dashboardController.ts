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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
      totalRevenueAgg,
      usersTrend,
      restaurantsTrend,
      revenueByDay,
      revenueByPlan,
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
      import("../models/paymentModel.js").then((m) =>
        m.Payment.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }]),
      ),
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Restaurant.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      import("../models/paymentModel.js").then((m) =>
        m.Payment.aggregate([
          { $match: { status: "completed", createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ),
      import("../models/paymentModel.js").then((m) =>
        m.Payment.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: "$planName", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
        ]),
      ),
    ]);

    const totalGuests = totalGuestsAgg[0]?.totalGuests || 0;
    const totalRevenue = (totalRevenueAgg as any)[0]?.totalRevenue || 0;

    createLog({
      message: `Admin dashboard statistics accessed`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      users: {
        total: totalUsers,
        newLast7Days: newUsers,
        trend: usersTrend,
      },
      restaurants: {
        total: totalRestaurants,
        newLast7Days: newRestaurants,
        trend: restaurantsTrend,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        totalGuests,
      },
      finance: {
        totalRevenue,
        revenueByDay,
        revenueByPlan,
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

export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalRestaurants, totalBookings, totalCities] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Booking.countDocuments(),
      Restaurant.distinct("address.city"),
    ]);

    res.status(200).json({
      users: totalUsers,
      restaurants: totalRestaurants,
      bookings: totalBookings,
      cities: totalCities.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
