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
  notes?: string;
  hiddenForUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
