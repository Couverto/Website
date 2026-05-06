import mongoose, { Schema, model } from "mongoose";
import { RestaurantFeature } from "./restaurantFeatureModel.js";
import { IRestaurant } from "../../interfaces/IRestaurant.js";

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    features: { type: [RestaurantFeature] },
  },
  { timestamps: true },
);

export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
