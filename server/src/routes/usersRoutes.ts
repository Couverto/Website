import express, { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  generateUserPassword,
  updatePassword,
  deleteAccount,
  getAuthTypesStat,
  searchUsers,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const userRouter: Router = express.Router();

/**
 * @route GET /search
 * @description Search users by name, email or username
 * @middleware verifyToken() - Ensures the user is authenticated
 */
userRouter.get("/search", verifyToken(), searchUsers);

/**
 * @route GET /
 * @description Retrieves a list of all users.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user has an admin role to access this route.
 */
userRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getUsers);

/**
 * @route POST /
 * @description Creates a new user with the provided data.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user has an admin role to access this route.
 */
userRouter.post("/", verifyToken({ role: userRoles.ADMIN }), createUser);

/**
 * @route PUT /:id
 * @description Updates an existing user by their ID.
 * @param {string} id - The ID of the user to update.
 * @middleware verifyToken() - Ensures the user is authenticated to access this route.
 */
userRouter.put("/:id", verifyToken(), updateUser);

/**
 * @route DELETE /:id
 * @description Deletes a user by their ID.
 * @param {string} id - The ID of the user to delete.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user has an admin role to access this route.
 */
userRouter.delete("/:id", verifyToken({ role: userRoles.ADMIN }), deleteUser);

/**
 * @route GET /utils/generatePassword
 * @description Generates a random password for the user.
 * @middleware verifyToken({ role: userRoles.ADMIN }) - Ensures the user has an admin role to access this route.
 */
userRouter.get("/utils/generatePassword", verifyToken({ role: userRoles.ADMIN }), generateUserPassword);

/**
 * @route PUT /:id/password
 * @description Updates the password of the user by their ID.
 * @param {string} id - The ID of the user to update the password for.
 * @middleware verifyToken() - Ensures the user is authenticated to access this route.
 */
userRouter.put("/:id/password", verifyToken(), updatePassword);

/**
 * @route DELETE /delete/account
 * @description Deletes the account of the currently authenticated user.
 * @middleware verifyToken() - Ensures the user is authenticated to access this route.
 */
userRouter.delete("/delete/account", verifyToken(), deleteAccount);

/** * @route GET /stats/authTypes
 * @description Retrieves statistics about the different authentication types used by users.
 * @middleware verifyToken(userRoles.ADMIN) - Ensures the user has an admin role to access this route.
 */
userRouter.get("/stats/authTypes", verifyToken({ role: userRoles.ADMIN }), getAuthTypesStat);
