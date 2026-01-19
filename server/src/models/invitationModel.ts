import mongoose, { Schema, model, Document } from "mongoose";

export interface IInvitation extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  restaurant: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  used: boolean;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Invitation = model<IInvitation>("Invitation", InvitationSchema);
