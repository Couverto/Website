import { model, Schema } from "mongoose";
import { IReview } from "../interfaces/IReview.js";

const reviewSchema = new Schema<IReview>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    reply: {
      text: { type: String },
      createdAt: { type: Date },
    },
  },
  { timestamps: true },
);

// Compound index to quickly fetch reviews for a restaurant
reviewSchema.index({ restaurant: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
