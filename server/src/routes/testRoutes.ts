import express, { Request, Response } from "express";
import { Booking } from "../models/bookingModel.js";
import { sendReviewRequestEmail } from "../services/emailService.js";

const router = express.Router();

/**
 * @route GET /api/test/simulate-review-email/:bookingId
 * @description Manually trigger a review request email for a specific booking.
 */
router.get("/simulate-review-email/:bookingId", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("restaurant");

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (!booking.customer.email) {
      res.status(400).json({ error: "Customer has no email address" });
      return;
    }

    const restaurant = booking.restaurant as any;
    const reviewUrl = `${process.env.CORS_ORIGIN}/account/add-review?bookingId=${booking._id}`;

    await sendReviewRequestEmail(booking.customer.email, booking.customer.name, restaurant.name, reviewUrl);

    res.status(200).json({ message: `Review request email sent to ${booking.customer.email}` });
  } catch (error: any) {
    console.error("Error simulating review email:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router as testRouter };
