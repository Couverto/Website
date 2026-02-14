import mongoose, { Document } from "mongoose";

export interface IReferralCode extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  restaurantId?: mongoose.Types.ObjectId;
  isActive: boolean;
  discountPercentage: number;
  type: "standard" | "sponsor";
  description?: string;
  maxUsages: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
