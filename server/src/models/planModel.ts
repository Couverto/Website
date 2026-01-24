import { Schema, model } from "mongoose";
import { IPlan } from "../interfaces/IPlan.js";

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    features: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Plan = model<IPlan>("Plan", PlanSchema);
