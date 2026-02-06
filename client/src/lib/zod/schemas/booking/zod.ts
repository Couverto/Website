import { z } from "zod";
import { validatePhone } from "@/lib/zod/validators/phone";

export const createBookingSchema = z.object({
  bookingDate: z.date({
    required_error: "Veuillez sélectionner une date.",
    invalid_type_error: "Date invalide.",
  }),
  time: z.string().min(1, { message: "Veuillez sélectionner une heure." }),
  guests: z.coerce.number().min(1, { message: "Au moins 1 couvert requis." }),
  customer: z.object({
    name: z.string().min(2, { message: "Le nom est requis." }),
    email: z.string().email({ message: "Adresse email invalide." }),
    phone: z.string().refine(validatePhone, { message: "Numéro de téléphone invalide." }),
  }),
  notes: z.string().optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
