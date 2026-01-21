import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Send, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "min_2_chars"),
  email: z.string().email("invalid_email"),
  reason: z.string().min(1, "required"),
  message: z.string().min(10, "min_10_chars"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const Contact = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
      message: "",
    },
  });

  // Check for navigation state to pre-select reason
  useEffect(() => {
    if (location.state?.reason === "recruitment") {
      form.setValue("reason", "recruitment");
    }
  }, [location.state, form]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xreeorzo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t("pages.contact.success"));
        form.reset();
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (error) {
      toast.error(t("pages.contact.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-[calc(100vh-10rem)] items-center">
          {/* Left Column: Visuals & Info */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">{t("pages.contact.title")}</h1>
              <p className="text-xl text-muted-foreground">{t("pages.contact.subtitle")}</p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-primary/5 border-primary/10 shadow-sm relative overflow-hidden group hover:bg-primary/10 transition-colors">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <h3 className="font-semibold text-lg">{t("pages.contact.info.email")}</h3>
                    <p className="text-muted-foreground">contact@couverto.fr</p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-br from-primary to-primary/60 rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageSquare className="w-48 h-48 -mr-10 -mt-10" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-bold">{t("pages.contact.info.title")}</h3>
                  <p className="text-primary-foreground/90 text-lg">{t("pages.contact.info.subtitle")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="order-1 lg:order-2">
            <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("pages.contact.form.title")}</CardTitle>
                <CardDescription>{t("pages.contact.form.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("pages.contact.form.name")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder={t("pages.contact.form.placeholders.name")} {...field} />
                              </div>
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
                            <FormLabel>{t("pages.contact.form.email")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder={t("pages.contact.form.placeholders.email")} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pages.contact.form.reason")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("pages.contact.form.placeholders.reason")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">{t("pages.contact.form.options.general")}</SelectItem>
                              <SelectItem value="partnership">{t("pages.contact.form.options.partnership")}</SelectItem>
                              <SelectItem value="support">{t("pages.contact.form.options.support")}</SelectItem>
                              <SelectItem value="recruitment">{t("pages.contact.form.options.recruitment")}</SelectItem>
                              <SelectItem value="other">{t("pages.contact.form.options.other")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pages.contact.form.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("pages.contact.form.placeholders.message")}
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        t("pages.contact.form.submitting")
                      ) : (
                        <>
                          {t("pages.contact.form.submit")} <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
