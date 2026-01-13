import mongoose, { Schema, model } from "mongoose";
import { IRestaurant } from "../interfaces/IRestaurant.js";

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    adress: { type: String, required: true, unique: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    website: { type: String, required: false },
    coverImage: { type: String, default: "" },
    images: { type: [String], default: [] },
    menu: { type: [String], default: [] },
    openingHours: {
      type: Map,
      of: String,
      default: {},
    },
    cuisineType: { type: [String], default: [] },
    priceRange: { type: String, enum: ["$", "$$", "$$$"], default: "$$" },
    rating: { type: Number, default: 0 },
    collaborators: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
