import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  forename: string;
  email: string;
  username: string;
  password: string;
  role: string;
  restaurant: mongoose.Types.ObjectId;
  avatar: string;
  auth_type: string;
  fullname?: string; // virtual
}
