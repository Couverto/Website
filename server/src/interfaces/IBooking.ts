import mongoose from "mongoose";
import { bookingStatus } from "../utils/enums/bookingStatus";

export interface IBooking {
  _id?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | null; // client connecté ou null si guest
  restaurant: mongoose.Types.ObjectId;
  status: bookingStatus;
  bookingDate: Date; // date + heure combinées
  guests: number;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  tableId?: string;
  zoneId?: string;
  notes?: string;
  isDismissedByRestaurant?: boolean;
  reviewRequestSent?: boolean;
  createdAt?: Date;
  stripeSetupIntentId?: string;
  stripeCustomerId?: string;
  bankImprintAmount?: number;
  bankImprintStatus?: "none" | "secured" | "captured" | "released" | "in_progress";
  bankImprintTransferred?: boolean;
  cancellationCode?: string;
  updatedAt?: Date;
}
