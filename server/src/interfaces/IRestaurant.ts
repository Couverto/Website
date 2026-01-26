import mongoose, { Document } from "mongoose";

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;

  coverImage?: string;
  images: string[];
  menu: string[];
  reviews: string[];
  shortDescription?: string;
  features: string[];
  paymentMethods: string[];
  socials: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  capacity: number;
  openingHours: Record<
    string,
    {
      isClosed: boolean;
      periods: { open: string; close: string }[];
    }
  >;
  cuisineType: string[];
  priceRange: string;
  rating: number;
  isClosed: boolean;
  collaborators: Array<mongoose.Types.ObjectId>;
  collaboratorRoles: Map<string, string>;

  // Subscription fields
  plan?: mongoose.Types.ObjectId;
  subscriptionStatus: "active" | "cancelled" | "expired" | "none" | "pending_payment";
  autoRenew: boolean;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  createdAt: Date;
  updatedAt: Date;
}
