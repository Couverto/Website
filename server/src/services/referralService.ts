import mongoose from "mongoose";
import { Restaurant } from "../models/restaurantModel.js";
import { ReferralCode } from "../models/referralCodeModel.js";
import { stripeService } from "./stripeService.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function rewardReferrer
 * @description Links a newly created (paid) restaurant to its referrer and updates the referrer's cumulative
 * Stripe discount. Called only once the referred restaurant really exists, i.e. after its payment, never when
 * the checkout is merely opened. Safe to call twice for the same restaurant (webhook and finalize fallback).
 * @param restaurant - The restaurant just created from a pending transaction.
 * @param userId - The user who created it (for logs).
 */
export const rewardReferrer = async (
  restaurant: { _id: mongoose.Types.ObjectId; name: string; referredBy?: any; referralCodeUsed?: any },
  userId?: mongoose.Types.ObjectId,
): Promise<void> => {
  if (!restaurant.referredBy) return;

  try {
    const referrer = await Restaurant.findByIdAndUpdate(restaurant.referredBy, { $addToSet: { referrals: restaurant._id } }, { new: true });
    if (!referrer) return;

    createLog({
      message: `Restaurant '${restaurant.name}' linked to referrer '${referrer.name}'`,
      userId,
      level: logLevels.INFO,
    });

    if (!referrer.stripeCustomerId) return;

    // The new restaurant is already saved, so it is included in the count
    const totalReferrals = await Restaurant.countDocuments({ referredBy: referrer._id });
    const referralCode = restaurant.referralCodeUsed ? await ReferralCode.findById(restaurant.referralCodeUsed) : null;
    const discountPerReferral = (referralCode as any)?.discountPercentage || 10;
    const totalDiscount = Math.min(totalReferrals * discountPerReferral, 100);

    await stripeService.applyCumulativeReferralDiscount(referrer.stripeCustomerId, totalDiscount, referrer._id.toString());

    createLog({
      message: `Cumulative referral discount updated for '${referrer.name}' (${totalDiscount}% off - ${totalReferrals} referrals)`,
      userId,
      level: logLevels.INFO,
    });
  } catch (err) {
    // Never fail the restaurant creation because of the referral reward
    console.error("[Referral] Failed to reward referrer:", err);
  }
};
