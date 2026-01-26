import { Schema, model } from "mongoose";
import { IFeature } from "../interfaces/IFeature.js";

const FeatureSchema = new Schema<IFeature>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Feature = model<IFeature>("Feature", FeatureSchema);
