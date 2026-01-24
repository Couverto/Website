import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";
import {
  getRestaurantPayments,
  createPayment,
  updateSubscription,
  getSubscription,
  cancelSubscription,
} from "../controllers/paymentController.js";

const router = Router();

// Get payment history for a restaurant (admin only)
router.get("/restaurants/:id/payments", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), getRestaurantPayments);

// Get subscription details for a restaurant
router.get("/restaurants/:id/subscription", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), getSubscription);

// Update subscription settings (plan, autoRenew)
router.put("/restaurants/:id/subscription", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), updateSubscription);

// Cancel subscription (closes restaurant)
router.delete("/restaurants/:id/subscription", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), cancelSubscription);

// Create a payment (internal use)
router.post("/payments", verifyToken(), createPayment);

export default router;
