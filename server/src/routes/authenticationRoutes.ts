import express, { Router } from "express";
import {
  getConnectedUser,
  login,
  logout,
  register,
  signInWithGoogle,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authenticationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { authLimiter } from "../middlewares/rateLimiters.js";

export const authRouter: Router = express.Router();
/**
 * @route POST /login
 * @description Authenticates a user with their credentials (e.g., email and password).
 */
authRouter.post("/login", authLimiter, login);

/**
 * @route POST /google
 * @description Authenticates a user using Google OAuth.
 * @body {Object} - Contains user details like name, email, and photoURL.
 */
authRouter.post("/login/google", authLimiter, signInWithGoogle);

/**
 * @route POST /register
 * @description Registers a new user with the provided details.
 */
authRouter.post("/register", authLimiter, register);

/**
 * @route POST /forgot-password
 * @description Initiates the password reset process.
 */
authRouter.post("/forgot-password", authLimiter, forgotPassword);

/**
 * @route POST /reset-password/:resetToken
 * @description Resets the password using a valid token.
 */
authRouter.post("/reset-password/:resetToken", authLimiter, resetPassword);

/**
 * @route GET /verify-email/:token
 * @description Verifies the user's email address.
 */
authRouter.get("/verify-email/:token", authLimiter, verifyEmail);

/**
 * @route GET /logout
 * @description Logs out the currently authenticated user.
 * @middleware verifyToken() - Ensures the user is authenticated before logging out.
 */
authRouter.get("/logout", verifyToken(), logout);

/**
 * @route GET /me
 * @description Fetches the currently authenticated user's information.
 * @middleware verifyToken() - Ensures the user is authenticated by validating the JWT token.
 */
authRouter.get("/me", verifyToken(), getConnectedUser);
