import { Request, Response } from "express";
import { z } from "zod";
import { sendEmail } from "../utils/sendEmail.js";

// Validation schema for contact requests
const contactAttemptSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  reason: z.string().min(1, "Ce champ est requis"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
});

/**
 * Handle contact form submissions
 * @route POST /api/contact
 * @access Public
 */
export const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = contactAttemptSchema.parse(req.body);

    const { name, email, reason, message } = validatedData;

    // Reason mapping for better email subject
    const reasonLabels: Record<string, string> = {
      general: "Question générale",
      partnership: "Partenariat / Restaurant",
      support: "Support technique",
      recruitment: "Recrutement / Carrières",
      other: "Autre",
    };

    const reasonLabel = reasonLabels[reason] || reason;

    // Construct the email HTML content
    const htmlMessage = `
      <h2>Nouveau message de contact via le site web Couverto</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Motif :</strong> ${reasonLabel}</p>
      <hr />
      <h3>Message :</h3>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    // Send the email to contact@couverto.fr using the sendEmail utility
    await sendEmail({
      email: "contact@couverto.fr",
      subject: `Nouveau message: ${reasonLabel} - ${name}`,
      message: htmlMessage,
    });

    res.status(200).json({ success: true, message: "Message envoyé avec succès." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Données invalides", details: error.issues });
      return;
    }

    console.error("Error in sendContactMessage controller:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};
