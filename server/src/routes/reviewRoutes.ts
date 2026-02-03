import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator as authorize } from "../middlewares/verifyCollaborator.js";
import { createReview, getRestaurantReviews, replyToReview, getUserReviews, deleteReview } from "../controllers/reviewController.js";

const router = Router();

// Public/Protected User Routes
router.post("/", verifyToken(), createReview); // User creates review (must be logged in)
router.get("/my-reviews", verifyToken(), getUserReviews); // Get user's own reviews
router.delete("/:reviewId", verifyToken(), deleteReview); // Delete own review

// Restaurant Routes
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.post("/:reviewId/reply", verifyToken(), authorize(["admin", "manager"]), replyToReview); // Reply to review

export const reviewRoutes = router;
