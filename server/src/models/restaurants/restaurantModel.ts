import { Schema, model } from "mongoose";
import { IRestaurant } from "../../interfaces/IRestaurant.js";
import { collaboratorRoles, cuisineTypes, paymentMethods, priceRanges, restaurantFeatures } from "../../utils/enums/restaurantEnums.js";
import { DayOpeningHoursSchema } from "./oppeningsModel.js";
import { ExceptionalClosureSchema, ExceptionalOpeningSchema } from "./closuresModel.js";
import { ZoneSchema } from "./zoneModel.js";
import { TableSchema } from "./tableModel.js";
import { RestaurantSubscriptionSchema } from "./subscriptionModel.js";
import { RestaurantReferralSchema } from "./referralModel.js";

const RestaurantSchema = new Schema<IRestaurant>(
  {
    // --- Identity ---
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String },
    shortDescription: { type: String }, // One-liner shown in listings

    // --- Contact & location ---
    address: { type: String, required: true },
    city: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tempEmail: { type: String }, // Pending email awaiting verification, see verificationToken
    website: { type: String },

    // --- Email verification ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpire: { type: Date, select: false },

    // --- Notifications ---
    sendBookingEmail: { type: Boolean, default: false },

    // --- Media & presentation ---
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    menu: { type: [String], default: [] },
    features: { type: [String], enum: Object.values(restaurantFeatures), default: [] },
    paymentMethods: { type: [String], enum: Object.values(paymentMethods), default: [] },
    cuisineType: { type: [String], enum: Object.values(cuisineTypes), default: [] },
    priceRange: { type: String, enum: Object.values(priceRanges), default: priceRanges.AFFORDABLE },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    socials: { type: Map, of: String, default: new Map() }, // keys constrained at app level via socialPlatforms enum

    // --- Booking / payment policy ---
    capacity: { type: Number, default: 0, min: 0 },
    isBankImprintEnabled: { type: Boolean, default: false },
    bankImprintAmount: { type: Number, default: 0, min: 0 },

    // --- Open/closed state ---
    isClosed: { type: Boolean, default: true },
    openingHours: { type: Map, of: DayOpeningHoursSchema, default: {} },
    exceptionalClosures: { type: [ExceptionalClosureSchema], default: [] },
    exceptionalOpenings: { type: [ExceptionalOpeningSchema], default: [] },

    // --- Floor plan ---
    zones: { type: [ZoneSchema], default: [] },
    // Legacy/flat floor plan, kept for restaurants not yet migrated to zones.
    // Consider removing once all restaurants use `zones`.
    tablePlan: { type: [TableSchema], default: [] },

    // --- Team ---
    collaborators: { type: [Schema.Types.ObjectId], ref: "User", default: [], required: true },
    collaboratorRoles: { type: Map, of: { type: String, enum: Object.values(collaboratorRoles) }, default: new Map() },

    // --- Subscription & referral (embedded, see dedicated sub-schemas) ---
    subscription: { type: RestaurantSubscriptionSchema, default: () => ({}) },
    referral: { type: RestaurantReferralSchema, default: () => ({}) },

    // --- External API access ---
    apiKey: { type: String, default: null, select: false }, // hashed, never returned by default
    apiKeyCreatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Useful indexes for common search/filter queries (slug lookup, search by city/cuisine).
RestaurantSchema.index({ city: 1 });
RestaurantSchema.index({ cuisineType: 1 });

/**
 * Normalizes the city name to a consistent "Title Case" format on save,
 * e.g. "  paris " -> "Paris", "new york" -> "New York".
 */
RestaurantSchema.pre("save", async function (this: IRestaurant) {
  if (this.isModified("city") && this.city) {
    this.city = this.city
      .trim()
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
});
export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
