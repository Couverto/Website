import { Schema, model } from "mongoose";
import { IPlan } from "../interfaces/IPlan.js";

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    features: { type: [{ type: Schema.Types.ObjectId, ref: "Feature" }], default: [] },
    active: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
    stripePriceId: { type: String, default: null },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Plan = model<IPlan>("Plan", PlanSchema);
