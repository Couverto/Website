import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRegisterSchema } from "@/lib/zod/schemas/auth/zod";
import { useAuthContext } from "@/contexts/authContext";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, UserPlus, Key, Mail } from "lucide-react";

export const RegisterGoogleForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const userData = location.state;
  const registerSchema = getRegisterSchema(t);

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

  useEffect(() => {
    if (!userData) {
      navigate("/login", { replace: true });
    } else {
      const { name, email, photoURL } = userData;
      form.reset({
        name: name.split(" ").slice(1).join(" ") || "",
        forename: name.split(" ")[0] || "",
        username: name.replace(/\s+/g, "").toLowerCase(),
        email: email,
        password: "",
        confirmPassword: "",
        photoURL: photoURL,
      });
    }
  }, [userData, navigate, form]);

  if (!userData) return null;

  async function register(values: z.infer<typeof registerSchema>) {
    try {
      setLoading(true);
      const response = await axiosConfig.post("/auth/register/", values);
      toast.success(t(response.data.message));
      setAuthUser(response.data.user);
      localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/app");
    } catch (error: any) {
      toast.error(t(error.response.data.error));
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { icon: Mail, text: t("pages.register_google.step_1"), done: true },
    { icon: UserPlus, text: t("pages.register_google.step_2"), done: false },
    { icon: Key, text: t("pages.register_google.step_3"), done: false },
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
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">C</span>
              </div>
              <span className="text-3xl font-bold">Couverto</span>
            </Link>

            <h2 className="text-3xl font-bold mb-4">{t("pages.register_google.hero_title")}</h2>

            <p className="text-white/80 text-lg mb-8">{t("pages.register_google.hero_subtitle")}</p>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center backdrop-blur-sm ${
                      step.done ? "bg-white/30" : "bg-white/10"
                    }`}
                  >
                    {step.done ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className={step.done ? "text-white" : "text-white/70"}>{step.text}</span>
                </div>
              ))}
            </div>

            {/* User info preview */}
            <div className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-4">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" className="h-14 w-14 rounded-full border-2 border-white/30" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xl font-bold">{userData.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-lg">{userData.name}</div>
                  <div className="text-sm text-white/70">{userData.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-primary">Couverto</span>
          </Link>

          {/* Mobile user preview */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-primary/10">
            {userData.photoURL ? (
              <img src={userData.photoURL} alt="Profile" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{userData.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="font-medium text-foreground">{userData.name}</div>
              <div className="text-xs text-muted-foreground">{userData.email}</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("pages.register_google.title")}</h1>
            <p className="text-muted-foreground">{t("pages.register_google.subtitle")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(register)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="forename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pages.register.forename")}</FormLabel>
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
                      <FormLabel>{t("pages.register.name")}</FormLabel>
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
                    <FormLabel>{t("pages.register.username")}</FormLabel>
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
                    <FormLabel>{t("pages.register.email")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled className="h-11 bg-muted" />
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
                      <FormLabel>{t("pages.register.password")}</FormLabel>
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
                      <FormLabel>{t("pages.register.confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-xs text-muted-foreground">{t("pages.register.terms_and_conditions")}</div>

              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? t("pages.register.registering") : t("pages.register_google.complete_registration")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("pages.register.already_have_account")}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t("pages.register.login")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{t("pages.login.trust_secure")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" />
              <span>{t("pages.login.trust_gdpr")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
