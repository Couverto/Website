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
  },
  { timestamps: true },
);

export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
