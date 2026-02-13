import { z } from "zod";
import { validateOptionalPhone } from "@/lib/zod/validators/phone";

export const getRestaurantSettingsSchema = () =>
  z
    .object({
      name: z.string().min(2, { message: "Le nom du restaurant est requis." }),
      phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),
      email: z.string().email({ message: "Adresse email invalide." }).optional().or(z.literal("")),
      website: z.string().url({ message: "URL invalide (doit commencer par https://)" }).optional().or(z.literal("")),
      socials: z
        .object({
          facebook: z.string().url({ message: "URL Facebook invalide (doit commencer par https://)" }).optional().or(z.literal("")),
          instagram: z.string().url({ message: "URL Instagram invalide (doit commencer par https://)" }).optional().or(z.literal("")),
          tiktok: z.string().url({ message: "URL Tiktok invalide (doit commencer par https://)" }).optional().or(z.literal("")),
        })
        .optional(),
      exceptionalClosures: z
        .array(
          z.object({
            startDate: z.union([z.string(), z.date()]),
            endDate: z.union([z.string(), z.date()]),
            reason: z.string().optional(),
          }),
        )
        .optional(),
    })
    .passthrough(); // Allow additional properties from RestaurantInterface
