import mongoose, { Document } from "mongoose";

export interface ITableClosure {
  tableId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  email: string;
  tempEmail?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpire?: Date;
  website?: string;
  sendBookingEmail: boolean;

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
  isBankImprintEnabled?: boolean;
  bankImprintAmount?: number;
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
  exceptionalClosures: {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[];
  exceptionalOpenings: {
    startDate: Date;
    endDate: Date;
    reason?: string;
    periods: { open: string; close: string }[];
  }[];
  tableClosures: ITableClosure[];
  collaborators: Array<mongoose.Types.ObjectId>;
  collaboratorRoles: Map<string, string>;

  // Subscription fields
  plan?: mongoose.Types.ObjectId;
  subscriptionStatus: "active" | "cancelled" | "expired" | "none" | "pending_payment";
  autoRenew: boolean;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeAccountId?: string;
  stripeConnectEnabled?: boolean;

  // Referral fields
  referralCode?: mongoose.Types.ObjectId;
  referredBy?: mongoose.Types.ObjectId;
  referralCodeUsed?: mongoose.Types.ObjectId;
  referrals: mongoose.Types.ObjectId[];
  subscriptionStartDelay: number;

  // External API
  apiKey?: string;
  apiKeyCreatedAt?: Date;
  // Table Plan
  zones: {
    id: string;
    name: string;
    tables: {
      id: string;
      label: string;
      seats: number;
      x: number;
      y: number;
      width: number;
      height: number;
      shape: "rect" | "circle";
      status: "available" | "reserved";
    }[];
  }[];

  /** @deprecated Use zones instead */
  tablePlan?: {
    id: string;
    label: string;
    seats: number;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: "rect" | "circle";
    status: "available" | "reserved";
  }[];

  createdAt: Date;
  updatedAt: Date;
}
