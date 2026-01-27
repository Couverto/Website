import { Document, Types } from "mongoose";

export interface IReview extends Document {
  restaurant: Types.ObjectId;
  user: Types.ObjectId;
  booking: Types.ObjectId;
  rating: number;
  comment?: string;
  reply?: {
    text: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
