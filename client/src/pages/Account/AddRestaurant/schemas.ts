import { z } from "zod";

export const getEssentialsSchema = () =>
  z.object({
    name: z.string().min(2, "Veuillez remplir tous les champs obligatoires."),
    adress: z.string().min(5, "Veuillez remplir tous les champs obligatoires."),
    city: z.string().min(2, "Veuillez remplir tous les champs obligatoires."),
    phone: z.string().min(10, "Le numéro de téléphone est requis."),
    email: z.string().email("Adresse email invalide."),
  });

export const getIdentitySchema = () =>
  z.object({
    cuisineType: z.array(z.string()).min(1, "Veuillez remplir tous les champs obligatoires."),
    priceRange: z.enum(["$", "$$", "$$$", "$$$$", "$$$$$"], {
      required_error: "Veuillez remplir tous les champs obligatoires.",
    }),
    shortDescription: z.string().max(100).optional(),
    description: z.string().min(20, "Veuillez remplir tous les champs obligatoires.").optional(),
  });

export const getDetailsSchema = () =>
  z.object({
    features: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).min(1, "Veuillez remplir tous les champs obligatoires."),
    capacity: z.number().min(1, "Au moins 1 couvert requis."),
    socials: z
      .object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        tiktok: z.string().url().optional().or(z.literal("")),
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
    coverImage: z.string().url().optional().or(z.literal("")),
    images: z.array(z.string().url()).optional(),
  });

export const getPlanSchema = () =>
  z.object({
    planId: z.string().min(1, "Veuillez sélectionner un plan."),
  });

export const getPaymentSchema = () =>
  z.object({
    cardHolder: z.string().min(3, "Le nom est requis."),
    cardNumber: z.string().regex(/^\d{16}$/, "Veuillez remplir tous les champs obligatoires."),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Date invalide."),
    cvc: z.string().regex(/^\d{3}$/, "Le CVC doit contenir 3 chiffres."),
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
