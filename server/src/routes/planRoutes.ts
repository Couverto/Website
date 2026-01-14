import express from "express";
import { getPlans, getAllPlans, createPlan, updatePlan, deletePlan } from "../controllers/planController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const planRouter = express.Router();

// Public route
planRouter.get("/public", getPlans);

// Admin routes
planRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getAllPlans);
planRouter.post("/", verifyToken({ role: userRoles.ADMIN }), createPlan);
planRouter.put("/:id", verifyToken({ role: userRoles.ADMIN }), updatePlan);
planRouter.delete("/:id", verifyToken({ role: userRoles.ADMIN }), deletePlan);
