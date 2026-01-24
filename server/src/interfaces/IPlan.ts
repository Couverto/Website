import { Document } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description?: string;
  price: number;
  features: string[];
  active: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
