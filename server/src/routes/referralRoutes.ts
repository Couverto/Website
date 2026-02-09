import express from "express";
import { validateReferralCode, getReferralInfo, toggleReferralCode } from "../controllers/referralController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";

export const referralRouter = express.Router();

// Public route - Validate a referral code (for wizard)
referralRouter.post("/validate", validateReferralCode);

// Restaurant admin routes
referralRouter.get("/restaurant/:id", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), getReferralInfo);

referralRouter.patch("/restaurant/:id/toggle", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), toggleReferralCode);
