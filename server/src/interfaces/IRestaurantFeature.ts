import mongoose from "mongoose";

export interface IRestaurantFeature {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  available: boolean;
  type: string;
}
