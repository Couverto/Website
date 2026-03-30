import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Restaurant } from "../models/restaurantModel.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import mongoose from "mongoose";

/**
 * Middleware to verify external API key for restaurant integrations.
 * Expects:
 *   - `X-API-Key` header: the plain API key
 *   - `X-Restaurant-Id` header: the restaurant's MongoDB ObjectId
 *
 * On success, sets `req.restaurantId` to the restaurant's ObjectId.
 * All failed attempts are logged for security auditing.
 */
export const verifyApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers["x-api-key"] as string;
  const restaurantId = req.headers["x-restaurant-id"] as string;
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

  if (!apiKey || !restaurantId) {
    createLog({
      message: `[API] Tentative sans en-têtes requis (IP: ${ip}, Restaurant-Id: ${restaurantId || "manquant"}, API-Key: ${apiKey ? "fournie" : "manquante"})`,
      level: logLevels.WARN,
    });
    res.status(401).json({ error: "En-têtes X-API-Key et X-Restaurant-Id requis" });
    return;
  }

  // Validate restaurantId format
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    createLog({
      message: `[API] ID de restaurant invalide (IP: ${ip}, Restaurant-Id: ${restaurantId})`,
      level: logLevels.WARN,
    });
    res.status(400).json({ error: "ID de restaurant invalide" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId).select("apiKey name");

    if (!restaurant || !restaurant.apiKey) {
      createLog({
        message: `[API] Clé API invalide — ${!restaurant ? "restaurant introuvable" : "aucune clé configurée"} (IP: ${ip}, Restaurant-Id: ${restaurantId})`,
        level: logLevels.WARN,
      });
      res.status(403).json({ error: "Clé API invalide" });
      return;
    }

    // Hash the provided key and compare
    const hashedKey = crypto
      .createHmac("sha256", process.env.API_KEY_SECRET || "couverto-api-key-secret")
      .update(apiKey)
      .digest("hex");

    if (hashedKey !== restaurant.apiKey) {
      createLog({
        message: `[API] Clé API incorrecte pour "${restaurant.name}" (IP: ${ip}, Restaurant-Id: ${restaurantId})`,
        level: logLevels.ERROR,
      });
      res.status(403).json({ error: "Clé API invalide" });
      return;
    }

    // Set restaurant ID on request for downstream controllers
    req.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    next();
  } catch (err: any) {
    console.error("API Key verification error:", err);
    createLog({
      message: `[API] Erreur interne lors de la vérification (IP: ${ip}, Restaurant-Id: ${restaurantId}): ${err.message}`,
      level: logLevels.ERROR,
    });
    res.status(500).json({ error: "Erreur interne" });
  }
};
