import { z } from "zod";
import i18next from "i18next";

export const createBookingSchema = z.object({
  bookingDate: z.date({
    required_error: i18next.t("components.booking.form.errors.date_required"),
    invalid_type_error: i18next.t("components.booking.form.errors.date_invalid"),
  }),
  time: z.string().min(1, { message: i18next.t("components.booking.form.errors.time_required") }),
  guests: z.coerce
    .number()
    .min(1, { message: i18next.t("components.booking.form.errors.guests_min") })
    .max(20, { message: i18next.t("components.booking.form.errors.guests_max") }),
  customer: z.object({
    name: z.string().min(2, { message: i18next.t("components.booking.form.errors.name_required") }),
    email: z
      .string()
      .email({ message: i18next.t("components.booking.form.errors.email_invalid") })
      .optional()
      .or(z.literal("")),
    phone: z.string().min(10, { message: i18next.t("components.booking.form.errors.phone_required") }),
  }),
  notes: z.string().optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;
