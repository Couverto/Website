import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getLoginSchema } from "@/lib/zod/schemas/auth/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useAuthContext } from "@/contexts/authContext";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useState } from "react";
import { OAuth } from "@/components/customs/oauth";
import { useConfigContext } from "@/contexts/configContext";
import { Calendar, Users, UtensilsCrossed, Check } from "lucide-react";
import { SEO } from "@/components/SEO";

export const Login = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuthContext();
  // const { configValues } = useConfigContext();
  // const appName = "Couverto";

  const loginSchema = getLoginSchema();
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginName: "",
      password: "",
    },
  });

  async function login(values: z.infer<typeof loginSchema>) {
    try {
      setLoading(true);

      const isEmail = /\S+@\S+\.\S+/.test(values.loginName);
      const payload = {
        password: values.password,
        ...(isEmail ? { email: values.loginName } : { username: values.loginName }),
      };
      const response = await axiosConfig.post("/auth/login", payload);

      toast.success(response.data.message || "Connexion réussie");
      setAuthUser(response.data.user);
      localStorage.setItem("accessToken", response.data.accessToken);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect || "/");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  const benefits = [
    { icon: Calendar, text: "Gestion des réservations en temps réel" },
    { icon: UtensilsCrossed, text: "Plan de salle interactif" },
    { icon: Users, text: "Fichier clients centralisé" },
  ];

  return (
    <div className="min-h-screen flex">
      <SEO title="Connexion - Couverto" description="Connectez-vous à votre espace Couverto pour gérer votre restaurant." url="/login" />
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-20 right-10 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                <img src="/logos/logo.svg" alt="Couverto" className="h-8 w-8" />
              </div>
              <span className="text-4xl font-bold font-logo tracking-tight">Couverto</span>
            </Link>

            <h2 className="text-3xl font-bold mb-4">{"Gérez votre restaurant en toute simplicité"}</h2>

            <p className="text-white/80 text-lg mb-8">
              La plateforme tout-en-un pour simplifier la gestion de vos réservations et booster votre établissement.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <span className="text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-white/90 italic mb-4">
                "{"Couverto"} a totalement transformé notre façon de travailler. C'est intuitif et nos clients apprécient la simplicité."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="font-bold">MR</span>
                </div>
                <div>
                  <div className="font-medium">{"Marie Rousseau"}</div>
                  <div className="text-sm text-white/70">{"Restaurant Le Petit Bistrot, Paris"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/logos/logo.svg" alt="Couverto" className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary font-logo tracking-tight">Couverto</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{"Bon retour !"}</h1>
            <p className="text-muted-foreground">{"Connectez-vous pour accéder à votre tableau de bord"}</p>
          </div>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(login)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="loginName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Email"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={"votre@email.com"} className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{"Mot de passe"}</FormLabel>
                      <Link to={`/forgot-password${location.search}`} className="text-sm text-primary hover:underline">
                        {"Mot de passe oublié ?"}
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} placeholder="••••••••" className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>

              {import.meta.env.VITE_FIREBASE_API_KEY && (
                <>
                  <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="relative z-10 px-3 bg-background text-muted-foreground">{"Ou continuer avec"}</span>
                  </div>
                  <OAuth message="Se connecter" />
                </>
              )}
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {"Pas encore de compte ?"}{" "}
            <Link to={`/register${location.search}`} className="font-medium text-primary hover:underline">
              {"Créer un compte"}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{"Connexion sécurisée"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{"Conforme RGPD"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
