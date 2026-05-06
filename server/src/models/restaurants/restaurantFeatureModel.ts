import mongoose, { Schema, model } from "mongoose";
import { IRestaurantFeature } from "../../interfaces/IRestaurantFeature.js";
import { restaurantFeatureType } from "../../utils/enums/restaurantFeatureType.js";

const RestaurantFeatureSchema = new Schema<IRestaurantFeature>({
  name: { type: String, unique: true, trim: true },
  icon: { type: String },
  available: { type: Boolean, default: false },
  type: { type: String, enum: restaurantFeatureType },
});

export const RestaurantFeature = model<IRestaurantFeature>("RestaurantFeature", RestaurantFeatureSchema);
