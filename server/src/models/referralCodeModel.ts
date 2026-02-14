import { Schema, model } from "mongoose";
import { IReferralCode } from "../interfaces/IReferralCode.js";

const ReferralCodeSchema = new Schema<IReferralCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: false },
    isActive: { type: Boolean, default: true },
    discountPercentage: { type: Number, default: 10, min: 0, max: 100 },
    type: { type: String, enum: ["standard", "sponsor"], default: "standard" },
    description: { type: String, required: false },
    maxUsages: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Generate a unique referral code
ReferralCodeSchema.statics.generateUniqueCode = async function (): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;
  let exists = true;

  while (exists) {
    code = "REF-";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    exists = (await this.findOne({ code })) !== null;
  }

  return code!;
};

export const ReferralCode = model<IReferralCode>("ReferralCode", ReferralCodeSchema);
