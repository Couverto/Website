import { z } from "zod";

export const createBookingSchema = z.object({
  bookingDate: z.date({
    required_error: "Veuillez sélectionner une date.",
    invalid_type_error: "Date invalide.",
  }),
  time: z.string().min(1, { message: "Veuillez sélectionner une heure." }),
  guests: z.coerce.number().min(1, { message: "Au moins 1 couvert requis." }),
  customer: z.object({
    name: z.string().min(2, { message: "Le nom est requis." }),
    email: z.string().email({ message: "Adresse email invalide." }).optional().or(z.literal("")),
    phone: z.string().min(10, { message: "Le numéro de téléphone est requis." }),
  }),
  notes: z.string().optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
