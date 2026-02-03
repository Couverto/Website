import { getRegisterSchema } from "@/lib/zod/schemas/auth/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/authContext";
import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OAuth } from "@/components/customs/oauth";
import { Check, Star, Shield, Zap } from "lucide-react";

export const Register = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuthContext();

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
    },
  });

  async function register(values: z.infer<typeof registerSchema>) {
    try {
      setLoading(true);
      const response = await axiosConfig.post("/auth/register", values);
      toast.success(response.data.message || "Inscription réussie");
      setAuthUser(response.data.user);
      localStorage.setItem("accessToken", response.data.accessToken);
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect || "/");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  const features = [
    { icon: Star, text: "Interface intuitive et facile à prendre en main" },
    { icon: Shield, text: "Données sécurisées et conformes RGPD" },
    { icon: Zap, text: "Support réactif et disponible" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-20 right-10 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                <img src="/logos/logo.svg" alt="Couverto" className="h-8 w-8" />
              </div>
              <span className="text-4xl font-bold font-logo tracking-tight">Couverto</span>
            </Link>

            <h2 className="text-3xl font-bold mb-4">Rejoignez {"Couverto"}</h2>

            <p className="text-white/80 text-lg mb-8">
              {"Des milliers de restaurateurs nous font confiance pour gérer leurs réservations au quotidien."}
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/70">{"restaurants"}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-sm text-white/70">{"réservations gérées"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/logos/logo.svg" alt="Couverto" className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-primary font-logo tracking-tight">Couverto</span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{"Créer un compte"}</h1>
            <p className="text-muted-foreground">{"Commencez à gérer votre restaurant dès maintenant"}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(register)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="forename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Prénom"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jean" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Nom"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dupont" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Nom d'utilisateur"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="jeandupont" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Email"}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="jean@restaurant.fr" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Mot de passe"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Confirmation"}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                {"En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité."}
              </div>

              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Création en cours..." : "Créer mon compte"}
              </Button>

              {import.meta.env.VITE_FIREBASE_API_KEY && (
                <>
                  <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="relative z-10 px-3 bg-background text-muted-foreground">{"Ou continuer avec"}</span>
                  </div>
                  <OAuth message="Inscription" />
                </>
              )}
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Déjà un compte ?"}{" "}
            <Link to={`/login${location.search}`} className="font-medium text-primary hover:underline">
              {"Se connecter"}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{"Inscription gratuite"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{"Sans carte bancaire"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
