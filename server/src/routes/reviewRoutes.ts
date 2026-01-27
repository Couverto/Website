import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator as authorize } from "../middlewares/verifyCollaborator.js";
import { createReview, getRestaurantReviews, replyToReview } from "../controllers/reviewController.js";

const router = Router();

// Public/Protected User Routes
router.post("/", verifyToken(), createReview); // User creates review (must be logged in)

// Restaurant Routes
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.post("/:reviewId/reply", verifyToken(), authorize(["admin", "manager"]), replyToReview); // Reply to review

export const reviewRoutes = router;
