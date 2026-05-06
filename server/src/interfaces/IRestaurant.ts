import mongoose from "mongoose";
import { RestaurantFeature } from "../models/restaurants/restaurantFeatureModel.js";

export interface IRestaurant {
  _id: mongoose.Types.ObjectId;
  name: string;
  features: typeof RestaurantFeature;
}
