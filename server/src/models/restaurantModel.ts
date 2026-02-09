import mongoose, { Schema, model } from "mongoose";
import { IRestaurant } from "../interfaces/IRestaurant.js";

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: false },
    adress: { type: String, required: true, unique: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: false },
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    menu: { type: [String], default: [] },
    reviews: { type: [String], default: [] },
    shortDescription: { type: String, required: false }, // One-liner
    features: { type: [String], default: [] }, // e.g. ["Terrace", "Wifi"]
    paymentMethods: { type: [String], default: [] }, // e.g. ["Card", "Cash"]
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    capacity: { type: Number, default: 0 },
    openingHours: {
      type: Map,
      of: {
        isClosed: { type: Boolean, default: false },
        periods: [
          {
            open: { type: String, required: true },
            close: { type: String, required: true },
          },
        ],
      },
      default: {},
    },
    cuisineType: { type: [String], default: [] },
    priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$", "$$$$$"], default: "$$" },
    rating: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false },
    collaborators: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "User",
      required: true,
    },
    collaboratorRoles: {
      type: Map,
      of: String,
      default: new Map(),
    },

    // Subscription fields
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "expired", "none", "pending_payment"],
      default: "none",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    // Referral fields
    referralCode: {
      type: Schema.Types.ObjectId,
      ref: "ReferralCode",
      default: null,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    referrals: {
      type: [Schema.Types.ObjectId],
      ref: "Restaurant",
      default: [],
    },
    subscriptionStartDelay: {
      type: Number,
      default: 0, // Days of delay before subscription starts
    },
  },
  { timestamps: true },
);

// Pre-save hook to normalize city name
RestaurantSchema.pre("save", function (next) {
  if (this.isModified("city") && this.city) {
    this.city = this.city
      .trim()
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  next();
});

export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
