import { z } from "zod";
import { validatePhone, validateOptionalPhone } from "@/lib/zod/validators/phone";

export const getCreateUserSchema = () =>
  z.object({
    name: z
      .string()
      .min(2, { message: "Le nom doit comporter au moins 2 caractères." })
      .max(25, { message: "Le nom doit comporter au maximum 25 caractères." }),
    forename: z
      .string()
      .min(2, { message: "Le prénom doit comporter au moins 2 caractères." })
      .max(25, { message: "Le prénom doit comporter au maximum 25 caractères." }),
    username: z
      .string()
      .min(2, { message: "Le nom d'utilisateur doit comporter au moins 2 caractères." })
      .max(25, { message: "Le nom d'utilisateur doit comporter au maximum 25 caractères." })
      .regex(/^[^A-Z\s]+$/, { message: "Le nom d'utilisateur ne doit pas contenir d'espaces ni de lettres majuscules." }),
    email: z.string().email({ message: "Adresse e-mail invalide." }),
    password: z.string().min(1, { message: "Le mot de passe est requis." }),
    phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),
    role: z.string(),
  });

export const getUpdateUserSchema = () =>
  z.object({
    name: z
      .string()
      .min(2, { message: "Le nom doit comporter au moins 2 caractères." })
      .max(25, { message: "Le nom doit comporter au maximum 25 caractères." }),
    forename: z
      .string()
      .min(2, { message: "Le prénom doit comporter au moins 2 caractères." })
      .max(25, { message: "Le prénom doit comporter au maximum 25 caractères." }),
    username: z
      .string()
      .min(2, { message: "Le nom d'utilisateur doit comporter au moins 2 caractères." })
      .max(25, { message: "Le nom d'utilisateur doit comporter au maximum 25 caractères." })
      .regex(/^[^A-Z\s]+$/, { message: "Le nom d'utilisateur ne doit pas contenir d'espaces ni de lettres majuscules." }),
    email: z.string().email({ message: "Adresse e-mail invalide." }),
    role: z.string(),
    phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),
    password: z.string().optional(),
  });

export const getDeleteUserSchema = () =>
  z.object({
    confirmDelete: z
      .string()
      .min(1, { message: 'Confirmez la suppression en tapant "DELETE".' })
      .transform((val) => val.toUpperCase()),
  });

export const getCreateRestaurantSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    slug: z.string().min(1, { message: "Le slug est requis" }),
    description: z.string().optional(),
    address: z.string().min(1, { message: "L'adresse est requise" }),
    city: z.string().min(1, { message: "La ville est requise" }),
    phone: z.string().refine(validatePhone, { message: "Numéro de téléphone invalide." }),
    website: z.string().optional(),
    coverImage: z.string().optional(),
    priceRange: z.enum(["$", "$$", "$$$"]).default("$$"),
    cuisineType: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).default(0),
    images: z.string().optional(),
    menu: z.string().optional(),
    openingHours: z.string().optional(),
  });
};

export const getUpdateRestaurantSchema = () => {
  return z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),
    website: z.string().optional(),
    coverImage: z.string().optional(),
    priceRange: z.enum(["$", "$$", "$$$"]).optional(),
    cuisineType: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    images: z.string().optional(),
    menu: z.string().optional(),
    openingHours: z.string().optional(),
  });
};

export const getDeleteRestaurantSchema = () => {
  return z.object({
    confirmDelete: z.string().min(1, {
      message: "Veuillez confirmer la suppression.",
    }),
  });
};
export const getCreatePlanSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    description: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Le prix est requis" }),
    features: z.array(z.string()).default([]),
    active: z.boolean(),
    position: z.coerce.number(),
    stripePriceId: z.string().optional(),
    isPopular: z.boolean().default(false),
  });
};

export const getUpdatePlanSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    description: z.string().optional(),
    price: z.coerce.number().min(0, { message: "Le prix est requis" }),
    features: z.array(z.string()).default([]),
    active: z.boolean(),
    position: z.coerce.number(),
    stripePriceId: z.string().optional(),
    isPopular: z.boolean().default(false),
  });
};

export const getDeletePlanSchema = () => {
  return z.object({
    confirmDelete: z.string().min(1, {
      message: 'Confirmez la suppression en tapant "DELETE".',
    }),
  });
};

export const getCreateFeatureSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    description: z.string().optional(),
    active: z.boolean().default(true),
    position: z.coerce.number().default(0),
  });
};

export const getUpdateFeatureSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    description: z.string().optional(),
    active: z.boolean(),
    position: z.coerce.number(),
  });
};

export const getDeleteFeatureSchema = () => {
  return z.object({
    confirmDelete: z.string().min(1, {
      message: 'Confirmez la suppression en tapant "DELETE".',
    }),
  });
};

export const getAdminUpdateRestaurantSchema = () => {
  return z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    slug: z.string().min(1, { message: "Le slug est requis" }),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    adress: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),
    website: z.string().url({ message: "URL invalide (doit commencer par https://)" }).optional().or(z.literal("")),
    email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
    coverImage: z.string().optional(),
    priceRange: z.enum(["$", "$$", "$$$"]).optional(),
    cuisineType: z.array(z.string()).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    images: z.array(z.string()).optional(),
    menu: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).optional(),
    socials: z
      .object({
        facebook: z.string().url({ message: "URL invalide (doit commencer par https://)" }).optional().or(z.literal("")),
        instagram: z.string().url({ message: "URL invalide (doit commencer par https://)" }).optional().or(z.literal("")),
        tiktok: z.string().url({ message: "URL invalide (doit commencer par https://)" }).optional().or(z.literal("")),
      })
      .optional(),
    openingHours: z.any().optional(),
  });
};
