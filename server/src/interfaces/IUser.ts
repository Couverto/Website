import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  forename: string;
  email: string;
  username: string;
  password: string;
  role: string;
  avatar: string;
  phone: string;
  auth_type: string;
  hasPassword?: boolean;
  fullname?: string; // virtual
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}
