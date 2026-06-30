import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { authTypes } from "../utils/enums/authTypes.js";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, uppercase: true },
    forename: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"],
    },

    username: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Only save password in case authTypes is LOCAL
    password: {
      type: String,
      select: false,
      required: [
        function (this: IUser) {
          return this.auth_type === authTypes.LOCAL;
        },
        "Le mot de passe est requis pour une authentification locale",
      ],
    },

    role: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.USER,
    },

    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },

    auth_type: {
      type: String,
      enum: Object.values(authTypes),
      default: authTypes.LOCAL,
    },

    // Add select false, so we dont get thoses infos by a find request
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    isVerified: { type: Boolean, default: false },

    verificationToken: { type: String, select: false },
    verificationTokenExpire: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.pre("save", async function (this: IUser) {
  if (this.isModified("forename") && this.forename) {
    this.forename = this.forename.charAt(0).toUpperCase() + this.forename.slice(1).toLowerCase();
  }
});

UserSchema.virtual("fullname").get(function (this: IUser) {
  return `${this.name} ${this.forename}`;
});

export const User = model<IUser>("User", UserSchema);
