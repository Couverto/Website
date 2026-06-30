import { Document, Types } from "mongoose";
import { userRoles } from "../utils/enums/userRoles.js";
import { authTypes } from "../utils/enums/authTypes.js";

/**
 * @description Represents a User document in the database.
 * Extends Mongoose's Document to provide typing for both schema fields
 * and Mongoose-specific properties (e.g. _id, virtuals, timestamps).
 */
export interface IUser extends Document {
  /** User's last name, stored in uppercase. */
  name: string;

  /** User's first name. Normalized (capitalized) on save. */
  forename: string;

  /** Unique email address, used for authentication and notifications. */
  email: string;

  /** Unique username, used for login/display purposes. */
  username: string;

  /**
   * Hashed password. Only required when auth_type is LOCAL.
   * Excluded from query results by default (select: false).
   */
  password?: string;

  /** User's role, used for access control (admin, owner, staff, user). */
  role: userRoles;

  /** URL or path to the user's avatar image. Defaults to an empty string. */
  avatar: string;

  /** User's phone number. Defaults to an empty string. */
  phone: string;

  /** Authentication method used by the user (local, google, etc.). */
  auth_type: authTypes;

  /**
   * Token used to verify a password reset request.
   * Excluded from query results by default (select: false).
   */
  resetPasswordToken?: string;

  /**
   * Expiration date for the password reset token.
   * Excluded from query results by default (select: false).
   */
  resetPasswordExpire?: Date;

  /** Whether the user's email/account has been verified. */
  isVerified: boolean;

  /**
   * Token used to verify the user's email address.
   * Excluded from query results by default (select: false).
   */
  verificationToken?: string;

  /**
   * Expiration date for the email verification token.
   * Excluded from query results by default (select: false).
   */
  verificationTokenExpire?: Date;

  /** Timestamp automatically managed by Mongoose ({ timestamps: true }). */
  createdAt: Date;

  /** Timestamp automatically managed by Mongoose ({ timestamps: true }). */
  updatedAt: Date;

  /** Virtual field combining name and formatted forename. Not stored in DB. */
  readonly fullname: string;
}
