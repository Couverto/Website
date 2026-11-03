import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Constants } from "../constants/constants.js";

/**
 * @description Generates a JWT (JSON Web Token) for the user, containing their user ID and token version.
 * @param {string} userId - The ID of the user for whom the token is being generated.
 * @param {number} tokenVersion - The user's current tokenVersion (tokens with an older version are rejected).
 * @returns {string} The generated JWT token.
 */
export const generateAccessToken = (userId: mongoose.Types.ObjectId, tokenVersion: number = 0): string => {
  if (!process.env.SECRET_ACCESS_TOKEN) {
    console.error("Please specify the access token secret in the .env file.");
    process.exit(1);
  } else {
    return jwt.sign({ id: userId, v: tokenVersion }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: Constants.MAX_AGE });
  }
};
