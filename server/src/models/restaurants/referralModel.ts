import { Schema } from "mongoose";
import { IRestaurantReferral } from "../../interfaces/IRestaurant.js";

/** Groups all referral-program-related fields together. */
export const RestaurantReferralSchema = new Schema<IRestaurantReferral>(
  {
    code: { type: Schema.Types.ObjectId, ref: "ReferralCode", default: null },
    referredBy: { type: Schema.Types.ObjectId, ref: "Restaurant", default: null },
    codeUsed: { type: Schema.Types.ObjectId, ref: "ReferralCode", default: null },
    referrals: { type: [Schema.Types.ObjectId], ref: "Restaurant", default: [] },
  },
  { _id: false },
);
