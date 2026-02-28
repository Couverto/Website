import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopySlash, Mail, MessageSquare, Send, User, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  reason: z.string().min(1, "Ce champ est requis"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
  captchaAnswer: z.string().min(1, "Veuillez répondre à la question"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor" stroke="none" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

export const Contact = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10) + 1);

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      reason: "",
      message: "",
      captchaAnswer: "",
    },
  });

  // Check for navigation state to pre-select reason
  useEffect(() => {
    if (location.state?.reason === "recruitment") {
      form.setValue("reason", "recruitment");
    }
  }, [location.state, form]);

  const onSubmit = async (data: ContactFormValues) => {
    // Validate captcha manually as zod validation operates on strings
    if (parseInt(data.captchaAnswer) !== num1 + num2) {
      form.setError("captchaAnswer", {
        type: "manual",
        message: "Réponse incorrecte",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          reason: data.reason,
          message: data.message,
        }),
      });

      if (response.ok) {
        toast.success("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
        form.reset();
        // Reset captcha for next potential submission
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Erreur lors de l'envoi");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-12 pb-12">
      <div className="container mx-auto px-4 max-w-6xl h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-[calc(100vh-10rem)] items-center">
          {/* Left Column: Visuals & Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">{"Contactez-nous"}</h1>
              <p className="text-xl text-muted-foreground">
                {"Une question ? Un projet ? Ou simplement envie de dire bonjour ? Nous sommes à votre écoute."}
              </p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-primary/5 border-primary/10 shadow-sm relative overflow-hidden group hover:bg-primary/10 transition-colors">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <h3 className="font-semibold text-lg">{"Email"}</h3>
                    <p className="text-muted-foreground">contact@couverto.fr</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#5865F2]/5 border-[#5865F2]/10 shadow-sm relative overflow-hidden group hover:bg-[#5865F2]/10 transition-colors">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-[#5865F2]/20 p-3 rounded-full text-[#5865F2] shrink-0 group-hover:scale-110 transition-transform">
                    <DiscordIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 relative z-10 flex flex-col justify-center">
                    <h3 className="font-semibold text-lg text-[#5865F2]">{"Discord"}</h3>
                    <a
                      href="https://discord.gg/wfCgbEVM"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-[#5865F2] transition-colors mt-1 font-medium"
                    >
                      Rejoignez notre communauté
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0077b5]/5 border-[#0077b5]/10 shadow-sm relative overflow-hidden group hover:bg-[#0077b5]/10 transition-colors">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-[#0077b5]/20 p-3 rounded-full text-[#0077b5] shrink-0 group-hover:scale-110 transition-transform">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 relative z-10 flex flex-col justify-center">
                    <h3 className="font-semibold text-lg text-[#0077b5]">{"LinkedIn"}</h3>
                    <a
                      href="https://www.linkedin.com/company/couverto/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-[#0077b5] transition-colors mt-1 font-medium"
                    >
                      Suivez notre actualité
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-br from-primary to-primary/60 rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageSquare className="w-48 h-48 -mr-10 -mt-10" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-bold">{"Discutons !"}</h3>
                  <p className="text-primary-foreground/90 text-lg">
                    {"Remplissez le formulaire et nous reviendrons vers vous rapidement."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{"Envoyez-nous un message"}</CardTitle>
                <CardDescription>
                  {"Choisissez le motif de votre contact pour que nous puissions vous orienter vers la bonne personne."}
                </CardDescription>
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
                            <FormLabel>{"Nom complet"}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder={"John Doe"} {...field} />
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
                            <FormLabel>{"Email"}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder={"john@example.com"} {...field} />
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
                          <FormLabel>{"Motif"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={"Sélectionnez un sujet"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">{"Question générale"}</SelectItem>
                              <SelectItem value="partnership">{"Partenariat / Restaurant"}</SelectItem>
                              <SelectItem value="support">{"Support technique"}</SelectItem>
                              <SelectItem value="recruitment">{"Recrutement / Carrières"}</SelectItem>
                              <SelectItem value="other">{"Autre"}</SelectItem>
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
                          <FormLabel>{"Message"}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={"Dites-nous en plus..."} className="min-h-[120px] resize-y" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="captchaAnswer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Combien font ${num1} + ${num2} ?`}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input className="pl-3" placeholder={"Votre réponse..."} type="number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          {"Envoyer le message"} <Send className="ml-2 h-4 w-4" />
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
