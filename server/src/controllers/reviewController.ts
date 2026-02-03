import { Request, Response } from "express";
import { Review } from "../models/reviewModel.js";
import { Booking } from "../models/bookingModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { sendThankYouReviewEmail } from "../services/emailService.js";
import { IUser } from "../interfaces/IUser.js";

// Create a new review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    // @ts-ignore
    const user = req.user;

    // 1. Verify booking exists
    const booking = await Booking.findById(bookingId).populate("restaurant");

    if (!booking) {
      res.status(404).json({ error: "Réservation introuvable." });
      return;
    }

    // Verify the booking belongs to this user (either by user ID or email match)
    const userEmail = user?.email?.toLowerCase();
    const bookingEmail = booking.customer?.email?.toLowerCase();
    const isUserMatch = booking.user && booking.user.toString() === user?._id?.toString();
    const isEmailMatch = userEmail && bookingEmail && userEmail === bookingEmail;

    if (!isUserMatch && !isEmailMatch) {
      res.status(403).json({ error: "Cette réservation ne vous appartient pas." });
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
      user: user?._id,
      booking: bookingId,
      rating,
      comment,
    });

    // 4. Send thank you email
    const bookingPopulated = await Booking.findById(bookingId).populate("restaurant user");
    if (bookingPopulated && bookingPopulated.customer.email) {
      const user = bookingPopulated.user as unknown as IUser;
      const restaurant = bookingPopulated.restaurant as any;
      await sendThankYouReviewEmail(bookingPopulated.customer.email, bookingPopulated.customer.name, restaurant.name);
    }

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
      .populate("user", "forename name avatar") // Show reviewer name and avatar
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

// Get reviews by the logged-in user
export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    const reviews = await Review.find({ user: userId }).populate("restaurant", "name coverImage").sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des avis." });
  }
};

// Delete a review (owner only)
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    // @ts-ignore
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({ error: "Avis introuvable." });
      return;
    }

    // Check ownership
    if (review.user?.toString() !== userId.toString()) {
      res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres avis." });
      return;
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: "Avis supprimé avec succès." });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'avis." });
  }
};
