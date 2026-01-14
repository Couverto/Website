import mongoose, { model, Schema } from "mongoose";
import { bookingStatus } from "../utils/enums/bookingStatus";
import { IBooking } from "../interfaces/IBooking";

const allowedBookingStatus = Object.values(bookingStatus);

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // réservation sans compte
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: allowedBookingStatus,
      default: bookingStatus.PENDING,
      index: true,
    },

    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    customer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
    },

    notes: {
      type: String,
    },

    canceledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Booking = model<IBooking>("Booking", bookingSchema);
