import { Document } from "mongoose";

export interface IFeature extends Document {
  name: string;
  description?: string;
  active: boolean;
  position: number;
  associatedPages?: string[];
  createdAt: Date;
  updatedAt: Date;
}
