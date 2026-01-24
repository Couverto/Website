import { z } from "zod";

export const getLoginSchema = () =>
  z.object({
    loginName: z
      .string()
      .min(2, { message: "Nom d'utilisateur ou email doit comporter au moins 2 caractères" })
      .regex(/^[^A-Z\s]+$/, { message: "Le nom d'utilisateur ou l'email ne doit pas contenir d'espaces ni de lettres majuscules." }),
    password: z
      .string()
      .min(1, { message: "Le mot de passe doit comporter au moins 6 caractères" })
      .max(255, { message: "Le mot de passe doit comporter au plus 255 caractères" }),
  });

export const getRegisterSchema = () =>
  z
    .object({
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
      email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
      password: z
        .string()
        .max(255, { message: "Le mot de passe doit comporter au maximum 255 caractères." })
        .min(1, {
          message:
            "Le mot de passe doit contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial.",
        }),
      confirmPassword: z.string(),
      photoURL: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmPassword"],
    });
