import { Request, Response } from "express";
import { ReferralCode } from "../models/referralCodeModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { Plan } from "../models/planModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function validateReferralCode
 * @description Validates a referral code (public endpoint for wizard)
 */
export const validateReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: "Code de parrainage requis" });
      return;
    }

    const referralCode = await ReferralCode.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    }).populate({
      path: "restaurantId",
      select: "name coverImage city",
    });

    if (!referralCode) {
      res.status(404).json({ error: "Code de parrainage invalide ou inactif" });
      return;
    }

    // Handle Sponsor Code
    if (referralCode.type === "sponsor") {
      res.status(200).json({
        valid: true,
        type: "sponsor",
        discountPercentage: referralCode.discountPercentage,
        benefits: {
          message:
            referralCode.discountPercentage === 100
              ? "Offre Sponsor : Abonnement gratuit à vie et accès complet !"
              : `Offre Sponsor : ${referralCode.discountPercentage}% de réduction à vie !`,
        },
      });
      return;
    }

    // Handle Standard Code
    if (!referralCode.restaurantId) {
      res.status(404).json({ error: "Code de parrainage invalide" });
      return;
    }

    res.status(200).json({
      valid: true,
      type: "standard",
      referrer: {
        id: referralCode.restaurantId._id,
        name: (referralCode.restaurantId as any).name,
        city: (referralCode.restaurantId as any).city,
        coverImage: (referralCode.restaurantId as any).coverImage,
      },
      benefits: {
        freeMonths: 1,
        message: "Vous bénéficierez d'1 mois d'abonnement gratuit !",
      },
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    res.status(500).json({ error: "Erreur lors de la validation du code" });
  }
};

/**
 * @function generateSponsorCode
 * @description Generates a new sponsor code (Admin only)
 */
export const generateSponsorCode = async (req: Request, res: Response): Promise<void> => {
  const { description, discountPercentage, maxUsages } = req.body;

  try {
    const code = await (ReferralCode as any).generateUniqueCode();

    const sponsorCode = new ReferralCode({
      code,
      type: "sponsor",
      isActive: true,
      description: description || "Code Sponsor",
      discountPercentage: discountPercentage !== undefined ? discountPercentage : 100,
      maxUsages: maxUsages || 1,
      usageCount: 0,
    });

    await sponsorCode.save();

    createLog({
      message: `Sponsor code generated: ${code}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ code, message: "Code sponsor généré avec succès" });
  } catch (error) {
    console.error("Error generating sponsor code:", error);
    res.status(500).json({ error: "Erreur lors de la génération du code sponsor" });
  }
};

export const getAllSponsorCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const codes = await ReferralCode.find({ type: "sponsor" }).sort({ createdAt: -1 });
    res.status(200).json(codes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @function getReferralInfo
 * @description Gets referral info for a restaurant (admin only)
 */
export const getReferralInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate({
        path: "referralCode",
        select: "code isActive discountPercentage createdAt",
      })
      .populate({
        path: "referredBy",
        select: "name coverImage city",
      })
      .populate({
        path: "plan",
        select: "name price",
      });

    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    // If no referral code exists, generate one
    let referralCode = restaurant.referralCode;
    if (!referralCode) {
      const code = await (ReferralCode as any).generateUniqueCode();
      const newReferralCode = new ReferralCode({
        code,
        restaurantId: restaurant._id,
        isActive: true,
        discountPercentage: 10,
      });
      await newReferralCode.save();

      restaurant.referralCode = newReferralCode._id as any;
      await restaurant.save();

      // Re-fetch the populated referral code
      referralCode = await ReferralCode.findById(newReferralCode._id);
    }

    // Query referred restaurants dynamically (restaurants that have referredBy = this restaurant)
    const referrals = await Restaurant.find({ referredBy: id })
      .select("name coverImage city createdAt subscriptionStatus")
      .sort({ createdAt: -1 });

    // Get plan price for discount calculation
    const planPrice = (restaurant.plan as any)?.price || 0;
    const discountPerReferral = (referralCode as any)?.discountPercentage || 10;

    // Calculate cumulative discount (each referral adds discountPerReferral%, max 100%)
    const totalDiscountPercentage = Math.min(referrals.length * discountPerReferral, 100);
    const discountAmount = (planPrice * totalDiscountPercentage) / 100;
    const priceAfterDiscount = planPrice - discountAmount;

    // Build discount history with running total
    let runningDiscountPercent = 0;
    const discountHistory = referrals.map((referral, index) => {
      runningDiscountPercent = Math.min(runningDiscountPercent + discountPerReferral, 100);
      const discountAmountAtThisPoint = (planPrice * discountPerReferral) / 100;
      return {
        _id: referral._id,
        name: referral.name,
        coverImage: referral.coverImage,
        city: referral.city,
        createdAt: referral.createdAt,
        subscriptionStatus: referral.subscriptionStatus,
        discountGained: discountPerReferral,
        discountAmountGained: discountAmountAtThisPoint,
        cumulativeDiscount: runningDiscountPercent,
      };
    });

    res.status(200).json({
      referralCode,
      referrals: discountHistory,
      referredBy: restaurant.referredBy || null,
      pricing: {
        planName: (restaurant.plan as any)?.name || "Standard",
        planPrice,
        discountPerReferral,
        totalDiscountPercentage,
        discountAmount,
        priceAfterDiscount,
      },
      stats: {
        totalReferrals: referrals.length,
        discountPercentage: discountPerReferral,
      },
    });
  } catch (error) {
    console.error("Error getting referral info:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des informations de parrainage" });
  }
};

/**
 * @function toggleReferralCode
 * @description Activates or deactivates a referral code
 */
export const toggleReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate("referralCode");
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    if (!restaurant.referralCode) {
      res.status(404).json({ error: "Aucun code de parrainage trouvé" });
      return;
    }

    const referralCode = await ReferralCode.findById(restaurant.referralCode);
    if (!referralCode) {
      res.status(404).json({ error: "Code de parrainage introuvable" });
      return;
    }

    referralCode.isActive = !referralCode.isActive;
    await referralCode.save();

    createLog({
      message: `Referral code ${referralCode.isActive ? "activated" : "deactivated"} for restaurant ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      referralCode,
      message: referralCode.isActive ? "Code activé" : "Code désactivé",
    });
  } catch (error) {
    console.error("Error toggling referral code:", error);
    res.status(500).json({ error: "Erreur lors de la modification du code" });
  }
};

/**
 * @function deleteSponsorCode
 * @description Deletes a sponsor code if it hasn't been used (Admin only)
 */
export const deleteSponsorCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const code = await ReferralCode.findById(id);
    if (!code) {
      res.status(404).json({ error: "Code introuvable" });
      return;
    }

    if (code.type !== "sponsor") {
      res.status(400).json({ error: "Ce n'est pas un code sponsor" });
      return;
    }

    if (code.usageCount > 0) {
      res.status(400).json({ error: "Impossible de supprimer un code déjà utilisé" });
      return;
    }

    await ReferralCode.findByIdAndDelete(id);

    createLog({
      message: `Sponsor code deleted: ${code.code}`,
      userId: req.userId,
      level: logLevels.WARN,
    });

    res.status(200).json({ message: "Code supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting sponsor code:", error);
    res.status(500).json({ error: "Erreur lors de la suppression du code" });
  }
};

/**
 * @function deleteUnusedSponsorCode
 * @description Deletes all unused sponsor codes (Admin only)
 */
export const deleteUnusedSponsorCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ReferralCode.deleteMany({ type: "sponsor", usageCount: 0 });

    createLog({
      message: `Deleted ${result.deletedCount} unused sponsor codes`,
      userId: req.userId,
      level: logLevels.WARN,
    });

    res.status(200).json({ message: `${result.deletedCount} codes supprimés avec succès`, count: result.deletedCount });
  } catch (error) {
    console.error("Error deleting unused sponsor codes:", error);
    res.status(500).json({ error: "Erreur lors de la suppression des codes" });
  }
};
