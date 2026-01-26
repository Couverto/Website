import express, { Router } from "express";
import { getAdminStats } from "../controllers/dashboardController.js";

import { getPayments } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const adminRouter: Router = express.Router();

/**
 * @route GET /stats
 * @description Retrieves global statistics for the admin dashboard.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is an admin.
 */
adminRouter.get("/stats", verifyToken({ role: userRoles.ADMIN }), getAdminStats);

/**
 * @route GET /payments
 * @description Retrieves all payments for the admin dashboard.
 */
adminRouter.get("/payments", verifyToken({ role: userRoles.ADMIN }), getPayments);
