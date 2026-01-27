import { Request, Response } from "express";
import { Review } from "../models/reviewModel.js";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";

// Create a new review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    // @ts-ignore
    const userId = req.user._id;

    // 1. Verify booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, user: userId });

    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable ou ne vous appartient pas." });
      return;
    }

    if (booking.status !== bookingStatus.CONFIRMED) {
      // Ideally we check if date is past. For now, let's assume if they have the link/id and it's confirmed, it's ok.
      // Or strictly check status.
    }

    // 2. Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      res.status(400).json({ error: "Vous avez déjà laissé un avis pour cette réservation." });
      return;
    }

    // 3. Create review
    const review = await Review.create({
      restaurant: booking.restaurant,
      user: userId,
      booking: bookingId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Erreur lors de la création de l'avis." });
  }
};

// Get reviews for a restaurant (Public or Protected based on route)
export const getRestaurantReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "forename name") // Show reviewer name
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des avis." });
  }
};

// Reply to a review (Restaurant Owner)
export const replyToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;
    // @ts-ignore
    const userId = req.user._id;

    const review = await Review.findById(reviewId).populate("restaurant");
    if (!review) {
      res.status(404).json({ error: "Avis introuvable." });
      return;
    }

    review.reply = {
      text,
      createdAt: new Date(),
    };

    await review.save();

    res.status(200).json(review);
  } catch (error) {
    console.error("Error replying to review:", error);
    res.status(500).json({ error: "Erreur lors de la réponse à l'avis." });
  }
};
