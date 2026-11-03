import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  // Set once the code has been checked, so the server can require proof before an email change
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Expires in 5 minutes (300 seconds)
  },
});

export const VerificationCode = mongoose.model("VerificationCode", verificationCodeSchema);
