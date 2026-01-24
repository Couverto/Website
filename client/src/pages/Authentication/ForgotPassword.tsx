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
import { useTranslation } from "react-i18next";
import { useConfigContext } from "@/contexts/configContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();
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
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send reset email");
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
          <h1 className="text-2xl font-bold tracking-tight">{t("pages.login.forgot_password")}</h1>
          <p className="text-muted-foreground mt-2">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {emailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-green-900">Email Sent</h3>
            <p className="text-green-700 text-sm">
              Check your inbox for the reset link. If you don't receive it within a few minutes, check your spam folder.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => setEmailSent(false)}>
              Try another email
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
                    <FormLabel>{t("pages.login.field")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="name@example.com" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
