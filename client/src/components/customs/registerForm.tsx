import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRegisterSchema } from "@/lib/zod/schemas/auth/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { OAuth } from "./oauth";
import { useConfigContext } from "@/contexts/configContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type RegisterFormProps = {
  onSubmit: (values: z.infer<any>) => Promise<void>;
  defaultValues?: Partial<z.infer<any>>;
  disabledFields?: string[];
  submitLabel?: string;
  loading?: boolean;
  oauth?: boolean;
};

export const RegisterForm = ({
  onSubmit,
  defaultValues = {},
  disabledFields = [],
  submitLabel,
  loading = false,
  oauth = false,
}: RegisterFormProps) => {
  const registerSchema = getRegisterSchema();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      forename: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...defaultValues,
    },
  });

  const { getConfigValue } = useConfigContext();
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchConfigValues = async () => {
      const values = await getConfigValue(["APP_NAME"]);
      setConfigValues(values);
    };

    fetchConfigValues();
  }, [getConfigValue]);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-2 py-4 md:px-10 md:py-10">
      <div className="flex items-center self-center gap-2 text-2xl font-medium sm:text-4xl text-accent">{configValues["APP_NAME"]}</div>
      <div className="flex flex-col w-full max-w-2xl gap-6 bg-background p-4 md:p-8 sm:rounded-2xl sm:shadow">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl">{oauth ? "Créer un compte" : "Créer un mot de passe "}</h1>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {["forename", "name"].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName as any}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{fieldName === "forename" ? "Prénom" : "Nom"}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={disabledFields.includes(fieldName)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {["username", "email"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldName === "username" ? "Nom d'utilisateur" : "Email"}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={disabledFields.includes(fieldName)} />
                      </FormControl>
                      {fieldName === "username" && <FormDescription>{"Entrez votre nom d'utilisateur"}</FormDescription>}
                      {fieldName === "email" && <FormDescription>{"Entrez votre email"}</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {["password", "confirmPassword"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldName === "password" ? "Mot de passe" : "Confirmer le mot de passe"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={disabledFields.includes(fieldName)} />
                      </FormControl>
                      <FormDescription>
                        {fieldName === "password" ? "Choisissez un mot de passe robuste" : "Veuillez confirmer votre mot de passe"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" className="w-full" disabled={loading}>
                {submitLabel || "Créer mon compte"}
              </Button>

              {import.meta.env.VITE_FIREBASE_API_KEY && oauth && (
                <>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">{"Ou continuer avec"}</span>
                  </div>
                  <OAuth message="S'inscrire" />
                </>
              )}
            </form>
          </Form>
          {oauth && (
            <div className="text-center text-sm md:text-base">
              {"Déjà un compte ?"}{" "}
              <Link to="/login" className="underline underline-offset-4 text-accent">
                {"Se connecter"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
