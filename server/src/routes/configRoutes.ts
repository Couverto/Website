import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { getConfig, updateConfig } from "../controllers/configController.js";

export const configRouter: Router = express.Router();

/**
 * @route GET /
 * @description Retrieves configuration settings based on provided keys.
 */
configRouter.get("/", getConfig);

/**
 * @route PUT /
 * @description Updates configuration settings based on provided keys and values.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is authenticated and has the 'admin' role.
 */
configRouter.put("/", verifyToken({ role: userRoles.ADMIN }), updateConfig);
