import { z } from "zod";

export const getCreateUserSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.name_min") })
      .max(25, { message: t("pages.admin.users_page.form.name_max") }),
    forename: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.forename_min") })
      .max(25, { message: t("pages.admin.users_page.form.forename_max") }),
    username: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.username_min") })
      .max(25, { message: t("pages.admin.users_page.form.username_max") })
      .regex(/^[^A-Z\s]+$/, { message: t("pages.admin.users_page.form.username_no_spaces") }),
    email: z.string().email({ message: t("pages.admin.users_page.form.invalid_email") }),
    password: z.string().min(1, { message: t("pages.admin.users_page.form.password_required") }),
    role: z.string(),
  });

export const getUpdateUserSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.name_min") })
      .max(25, { message: t("pages.admin.users_page.form.name_max") }),
    forename: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.forename_min") })
      .max(25, { message: t("pages.admin.users_page.form.forename_max") }),
    username: z
      .string()
      .min(2, { message: t("pages.admin.users_page.form.username_min") })
      .max(25, { message: t("pages.admin.users_page.form.username_max") })
      .regex(/^[^A-Z\s]+$/, { message: t("pages.admin.users_page.form.username_no_spaces") }),
    email: z.string().email({ message: t("pages.admin.users_page.form.invalid_email") }),
    role: z.string(),
    password: z.string().optional(),
  });

export const getDeleteUserSchema = (t: (key: string) => string) =>
  z.object({
    confirmDelete: z
      .string()
      .min(1, { message: t("pages.admin.users_page.form.confirm_delete_required") })
      .transform((val) => val.toUpperCase()),
  });

export const getCreateRestaurantSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, { message: t("pages.admin.restaurants_page.form.errors.name_required") }),
    slug: z.string().min(1, { message: t("pages.admin.restaurants_page.form.errors.slug_required") }),
    description: z.string().optional(),
    address: z.string().min(1, { message: t("pages.admin.restaurants_page.form.errors.address_required") }),
    city: z.string().min(1, { message: t("pages.admin.restaurants_page.form.errors.city_required") }),
    phone: z.string().min(1, { message: t("pages.admin.restaurants_page.form.errors.phone_required") }),
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

export const getUpdateRestaurantSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
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

export const getDeleteRestaurantSchema = (t: (key: string) => string) => {
  return z.object({
    confirmDelete: z.string().min(1, {
      message: t("pages.admin.users_page.form.errors.confirm_delete_required"),
    }),
  });
};
