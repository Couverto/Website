import express from "express";
import {
  validateReferralCode,
  getReferralInfo,
  toggleReferralCode,
  generateSponsorCode,
  getAllSponsorCodes,
  deleteSponsorCode,
  deleteUnusedSponsorCode,
} from "../controllers/referralController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const referralRouter = express.Router();

// Public route - Validate a referral code (for wizard)
referralRouter.post("/validate", validateReferralCode);

// Restaurant admin routes
referralRouter.get("/restaurant/:id", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), getReferralInfo);

referralRouter.patch("/restaurant/:id/toggle", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), toggleReferralCode);

// Admin route - Generate sponsor code
referralRouter.post("/sponsor", verifyToken({ role: userRoles.ADMIN }), generateSponsorCode);
referralRouter.get("/sponsor", verifyToken({ role: userRoles.ADMIN }), getAllSponsorCodes);
referralRouter.delete("/sponsor/unused", verifyToken({ role: userRoles.ADMIN }), deleteUnusedSponsorCode);
referralRouter.delete("/sponsor/:id", verifyToken({ role: userRoles.ADMIN }), deleteSponsorCode);
