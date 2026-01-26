import { Document } from "mongoose";

export interface IFeature extends Document {
  name: string;
  description?: string;
  active: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
