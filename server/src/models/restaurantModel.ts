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
