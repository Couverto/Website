import mongoose, { Document } from "mongoose";

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  website?: string;
  collaborators: Array<mongoose.Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
