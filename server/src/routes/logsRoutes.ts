import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { deleteAllLogs, deleteLog, getLoglevels, getLogs } from "../controllers/logController.js";

export const logRouter: Router = express.Router();

/**
 * @route GET /
 * @description Retrieves all logs.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is authenticated and has the 'admin' role.
 */
logRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getLogs);

/**
 * @route GET /log-levels
 * @description Retrieves all available log levels.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is authenticated and has the 'admin' role.
 */
logRouter.get("/log-levels", verifyToken({ role: userRoles.ADMIN }), getLoglevels);

/**
 * @route DELETE /:id
 * @description Deletes a specific log by ID.
 * @param {string} id - The ID of the log to delete.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is authenticated and has the 'admin' role.
 */
logRouter.delete("/:id", verifyToken({ role: userRoles.ADMIN }), deleteLog);

/**
 * @route DELETE /
 * @description Deletes all logs.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user is authenticated and has the 'admin' role.
 */
logRouter.delete("/", verifyToken({ role: userRoles.ADMIN }), deleteAllLogs);
