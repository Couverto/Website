import { z } from "zod";
import { TFunction } from "i18next";

export const getEssentialsSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(2, t("components.booking.form.errors.missing_fields")),
    address: z.string().min(5, t("components.booking.form.errors.missing_fields")),
    city: z.string().min(2, t("components.booking.form.errors.missing_fields")),
    phone: z.string().min(10, t("components.booking.form.errors.phone_required")),
    email: z.string().email(t("components.booking.form.errors.email_invalid")),
  });

export const getIdentitySchema = (t: TFunction) =>
  z.object({
    cuisineType: z.array(z.string()).min(1, t("components.booking.form.errors.missing_fields") || "Select at least one"),
    priceRange: z.enum(["$", "$$", "$$$", "$$$$", "$$$$$"], {
      required_error: t("components.booking.form.errors.missing_fields") || "Required",
    }),
    shortDescription: z.string().max(100).optional(),
    description: z
      .string()
      .min(20, t("components.booking.form.errors.missing_fields") || "Too short")
      .optional(),
  });

export const getDetailsSchema = (t: TFunction) =>
  z.object({
    features: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).min(1, t("components.booking.form.errors.missing_fields") || "Required"),
    capacity: z.number().min(1, t("components.booking.form.errors.guests_min")),
    socials: z
      .object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        tiktok: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
    website: z.string().url().optional().or(z.literal("")),
  });

export const getMenuSchema = (t: TFunction) =>
  z.object({
    menu: z.array(z.string().url()).optional(),
  });

export const getMediaSchema = (t: TFunction) =>
  z.object({
    coverImage: z.string().url().optional().or(z.literal("")),
    images: z.array(z.string().url()).optional(),
  });

export const getPaymentSchema = (t: TFunction) =>
  z.object({
    cardHolder: z.string().min(3, t("components.booking.form.errors.name_required")),
    cardNumber: z.string().regex(/^\d{16}$/, t("components.booking.form.errors.missing_fields") || "Invalid card"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, t("components.booking.form.errors.date_invalid")),
    cvc: z.string().regex(/^\d{3,4}$/, t("components.booking.form.errors.missing_fields") || "Invalid CVC"),
  });

export const getOpeningHoursSchema = (t: TFunction) =>
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

export const getRestaurantWizardSchema = (t: TFunction) =>
  z.object({
    ...getEssentialsSchema(t).shape,
    ...getIdentitySchema(t).shape,
    ...getDetailsSchema(t).shape,
    ...getMenuSchema(t).shape,
    ...getMediaSchema(t).shape,
    ...getPaymentSchema(t).shape,
    openingHours: getOpeningHoursSchema(t),
  });

export type WizardData = z.infer<ReturnType<typeof getRestaurantWizardSchema>>;
