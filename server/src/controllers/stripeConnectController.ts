import { Request, Response } from "express";
import { Restaurant } from "../models/restaurantModel.js";
import { stripeService } from "../services/stripeService.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

export const createConnectAccountLink = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate("collaborators");
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    // Step 1: Create Stripe Account if not exists or if we need a fresh one
    let accountId = restaurant.stripeAccountId;

    // Verify the account actually exists in Stripe if we have an ID
    if (accountId) {
      try {
        await stripeService.retrieveAccount(accountId);
      } catch (e: any) {
        console.warn(
          `[Stripe Connect] Existing account ${accountId} not found in Stripe. Creating a newhttp://localhost:5173/dashboard/699df6e8659e52a30cb76447/settings?connect=return one.`,
        );
        accountId = null; // Force recreation
      }
    }

    if (!accountId) {
      const owner = (restaurant.collaborators as any[])?.[0];
      const customerEmail = owner?.email || "contact@couverto.fr";
      const account = await stripeService.createConnectAccount(customerEmail);
      accountId = account.id;
      restaurant.stripeAccountId = accountId;
      await restaurant.save();
    }

    // Step 2: Create Account Link
    const refreshUrl = `${process.env.CORS_ORIGIN}/restaurant/${id}/settings?connect=refresh`;
    const returnUrl = `${process.env.CORS_ORIGIN}/restaurant/${id}/settings?connect=return`;

    const accountLink = await stripeService.createAccountLink(accountId, refreshUrl, returnUrl);

    createLog({
      message: `Stripe Connect onboarding initiated for restaurant ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err: any) {
    console.error("Error creating Connect Account Link:", err);
    res.status(500).json({ error: err.message });
  }
};
