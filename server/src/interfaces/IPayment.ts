import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
