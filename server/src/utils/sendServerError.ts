import { Response } from "express";

/**
 * @function sendServerError
 * @description Logs an unexpected error and answers with a generic message: internal details
 * (database, Stripe, stack...) are never sent to the client. Invalid ids / documents become 400s.
 */
export const sendServerError = (res: Response, err: unknown): void => {
  const name = (err as { name?: string } | null)?.name;
  if (name === "CastError" || name === "ValidationError") {
    res.status(400).json({ error: "Données invalides" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
};
