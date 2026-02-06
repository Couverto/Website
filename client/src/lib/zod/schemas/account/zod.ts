import { z } from "zod";
import { validateOptionalPhone } from "@/lib/zod/validators/phone";

export const getUpdateAccountSchema = () =>
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

    phone: z.string().refine(validateOptionalPhone, { message: "Numéro de téléphone invalide." }).optional(),

    email: z.string().email({ message: "Adresse e-mail invalide." }),
  });

export const getUpdatePasswordSchema = (hasPassword = true) =>
  z
    .object({
      currentPassword: hasPassword
        ? z.string().min(6, { message: "Le mot de passe actuel doit comporter au moins 6 caractères." })
        : z.string().optional(),
      newPassword: z
        .string()
        .min(6, { message: "Le nouveau mot de passe doit comporter au moins 6 caractères." })
        .max(25, { message: "Le mot de passe doit comporter au maximum 25 caractères." }),
      newPasswordConfirm: z.string().min(6, { message: "La confirmation du nouveau mot de passe doit comporter au moins 6 caractères." }),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["newPasswordConfirm"],
    });

export const getDeleteAccountSchema = () =>
  z.object({
    checkApproval: z.boolean().refine((val) => val === true, {
      message: "Veuillez cocher la case pour confirmer la suppression de votre compte.",
    }),
    password: z.string().optional(),
  });
