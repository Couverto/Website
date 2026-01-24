import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useState } from "react";
import { useConfigContext } from "@/contexts/configContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { configValues } = useConfigContext();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    try {
      setLoading(true);
      await axiosConfig.post("/auth/forgot-password", values);
      setEmailSent(true);
      toast.success("Lien de réinitialisation envoyé à votre adresse email");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-primary">{configValues["APP_NAME"]}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{"Mot de passe oublié ?"}</h1>
          <p className="text-muted-foreground mt-2">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {emailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-green-900">E-mail envoyé</h3>
            <p className="text-green-700 text-sm">
              Consultez votre boîte de réception pour le lien de réinitialisation. Si vous ne le recevez pas dans quelques minutes, vérifiez
              votre dossier de spam.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => setEmailSent(false)}>
              Essayer un autre e-mail
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Email"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="nom@exemple.com" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};
