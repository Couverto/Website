import express from "express";
import { getFeatures, getAllFeatures, createFeature, updateFeature, deleteFeature } from "../controllers/featureController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const featureRouter = express.Router();

// Public route (if needed, otherwise just admin)
featureRouter.get("/public", getFeatures);

// Admin routes
featureRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getAllFeatures);
featureRouter.post("/", verifyToken({ role: userRoles.ADMIN }), createFeature);
featureRouter.put("/:id", verifyToken({ role: userRoles.ADMIN }), updateFeature);
featureRouter.delete("/:id", verifyToken({ role: userRoles.ADMIN }), deleteFeature);
