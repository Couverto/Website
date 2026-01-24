import { Schema, model } from "mongoose";
import { IPayment } from "../interfaces/IPayment.js";

const paymentStatus = ["pending", "completed", "failed", "refunded"];

const PaymentSchema = new Schema<IPayment>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: paymentStatus,
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
