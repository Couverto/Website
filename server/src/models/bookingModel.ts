import { model, Schema } from "mongoose";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { IBooking } from "../interfaces/IBooking.js";

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
    isDismissedByRestaurant: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewRequestSent: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

export const Booking = model<IBooking>("Booking", bookingSchema);
