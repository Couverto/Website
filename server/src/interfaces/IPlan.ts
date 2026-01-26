import { Document, Schema } from "mongoose";
import { IFeature } from "./IFeature.js";

export interface IPlan extends Document {
  name: string;
  description?: string;
  price: number;
  features: Schema.Types.ObjectId[] | IFeature[];
  active: boolean;
  position: number;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}
