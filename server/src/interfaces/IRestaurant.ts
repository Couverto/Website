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
  coverImage?: string;
  images: string[];
  menu: string[];
  openingHours: Map<string, string>;
  cuisineType: string[];
  priceRange: string;
  rating: number;
  collaborators: Array<mongoose.Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
