import { z } from "zod";

export const getEssentialsSchema = () =>
  z.object({
    addressVerified: z.boolean().refine((val) => val === true, "Veuillez sélectionner une adresse valide dans la liste."),
    cityVerified: z.boolean().refine((val) => val === true, "Veuillez sélectionner une ville valide dans la liste."),
    name: z.string().min(2, "Le nom du restaurant est requis (min 2 caractères)."),
    adress: z.string().min(5, "L'adresse est requise.").regex(/\d/, "L'adresse doit inclure un numéro de rue."),
    city: z.string().min(2, "La ville est requise."),
    phone: z.string().min(10, "Le numéro de téléphone est requis."),
    email: z.string().email("Adresse email invalide."),
  });

export const getIdentitySchema = () =>
  z.object({
    cuisineType: z.array(z.string()).min(1, "Veuillez sélectionner au moins un type de cuisine."),
    priceRange: z.enum(["$", "$$", "$$$", "$$$$", "$$$$$"], {
      required_error: "Veuillez sélectionner une fourchette de prix.",
    }),
    shortDescription: z.string().max(100).optional(),
    description: z.string().min(20, "La description doit contenir au moins 20 caractères."),
  });

export const getDetailsSchema = () =>
  z.object({
    features: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).min(1, "Veuillez sélectionner au moins un moyen de paiement."),
    capacity: z.number().min(1, "Au moins 1 couvert requis."),
    socials: z
      .object({
        facebook: z.string().url("URL Facebook invalide").optional().or(z.literal("")),
        instagram: z.string().url("URL Instagram invalide").optional().or(z.literal("")),
        tiktok: z.string().url("URL Tiktok invalide").optional().or(z.literal("")),
      })
      .optional(),
    website: z.string().url().optional().or(z.literal("")),
  });

export const getMenuSchema = () =>
  z.object({
    menu: z.array(z.string().url()).optional(),
  });

export const getMediaSchema = () =>
  z.object({
    coverImage: z.string().optional(),
    images: z.array(z.string()).optional(),
  });

export const getPlanSchema = () =>
  z.object({
    planId: z.string().min(1, "Veuillez sélectionner un plan."),
  });

export const getPaymentSchema = () =>
  z.object({
    // Payment is handled by Stripe Checkout
  });

export const getOpeningHoursSchema = () =>
  z.record(
    z.object({
      isClosed: z.boolean().default(false),
      periods: z.array(
        z.object({
          open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:mm"),
          close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:mm"),
        }),
      ),
    }),
  );

export const getRestaurantWizardSchema = () =>
  z.object({
    ...getEssentialsSchema().shape,
    ...getIdentitySchema().shape,
    ...getDetailsSchema().shape,
    ...getMenuSchema().shape,
    ...getMediaSchema().shape,
    ...getPlanSchema().shape,
    ...getPaymentSchema().shape,
    openingHours: getOpeningHoursSchema(),
  });

export type WizardData = z.infer<ReturnType<typeof getRestaurantWizardSchema>>;
