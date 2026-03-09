import { useParams, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRestaurantSettingsSchema } from "@/lib/zod/schemas/restaurant/zod";
import { Badge } from "@/components/ui/badge";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import {
  Loader2,
  Save,
  Clock,
  Utensils,
  Info,
  X,
  Plus,
  Search,
  Check,
  ChevronDown,
  Facebook,
  Instagram,
  Share2,
  Wifi,
  Umbrella,
  Accessibility,
  Beer,
  Wind,
  Car,
  Dog,
  CreditCard,
  Banknote,
  Smartphone,
  Ticket,
  StickyNote,
  Power,
  Trash2,
  AlertTriangle,
  Music2,
  MapPin,
  Code,
  Files,
  Lock,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FEATURES_LIST, PAYMENT_METHODS } from "@/constants/restaurantResources";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { PriceRangeControl } from "@/components/customs/PriceRangeControl";
import { CuisineSelector } from "@/components/CuisineSelector";
import { AddressAutocomplete } from "@/components/customs/AddressAutocomplete";
import { PhoneInput } from "@/components/customs/phoneInput";
import { ExceptionalClosuresEditor } from "@/components/ExceptionalClosuresEditor";
import { Switch } from "@/components/ui/switch";
import { EmailVerificationSection } from "@/components/business/EmailVerificationSection";

export const RestaurantSettings = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [toggling, setToggling] = useState(false);
  const { refreshRestaurant, availablePages } = useOutletContext<{ refreshRestaurant: () => void; availablePages: string[] }>();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const hasTablePlan = availablePages?.includes("tablePlan");
  const hasBankImprint = availablePages?.includes("bankImprint");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const connectStatus = searchParams.get("connect");
    if (connectStatus === "return") {
      toast.success("Retour de Stripe Connect. Vos informations sont en cours de validation.");
      searchParams.delete("connect");
      setSearchParams(searchParams, { replace: true });
    } else if (connectStatus === "refresh") {
      toast.error("Configuration Stripe interrompue. Veuillez réessayer.");
      searchParams.delete("connect");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Email verification state
  const [originalEmail, setOriginalEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<RestaurantInterface>({
    resolver: zodResolver(getRestaurantSettingsSchema()) as any,
    defaultValues: {
      cuisineType: [],
      features: [],
      paymentMethods: [],
      images: [],
      socials: { facebook: "", instagram: "", tiktok: "" },
      openingHours: {},
    },
  });

  const currentEmail = watch("email");

  useEffect(() => {
    if (currentEmail !== originalEmail) {
      setIsEmailVerified(false);
    } else {
      setIsEmailVerified(true);
    }
  }, [currentEmail, originalEmail]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        reset(response.data.restaurant);
        setOriginalEmail(response.data.restaurant.email);
        setIsEmailVerified(true);
        setIsClosed(response.data.restaurant.isClosed);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRestaurant();
  }, [id, reset]);

  const handleToggleClosed = async () => {
    setToggling(true);
    try {
      const response = await api.patch(`/restaurants/${id}/toggle-closed`);
      setIsClosed(response.data.restaurant.isClosed);
      toast.success(response.data.restaurant.isClosed ? "Restaurant fermé" : "Restaurant rouvert");
      refreshRestaurant(); // Call parent refresh
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    setDeleting(true);
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success("Restaurant supprimé");
      navigate("/account/restaurants");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setDeleting(false);
    }
  };

  const addressValid = useRef(true);
  const cityValid = useRef(true);

  const onSubmit = async (data: RestaurantInterface) => {
    setSaving(true);

    if (currentEmail !== originalEmail && !isEmailVerified) {
      data.email = originalEmail;
      toast.info("Changement d'email ignoré car non vérifié");
    }

    try {
      await api.put(`/restaurants/${id}/settings`, data);
      toast.success("Modifications enregistrées");

      if (data.email !== originalEmail) {
        setOriginalEmail(data.email!);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.error || "";
        const lowerError = errorMessage.toLowerCase();

        if (lowerError.includes("email")) {
          setError(
            "email",
            {
              type: "manual",
              message: errorMessage,
            },
            { shouldFocus: true },
          );
          return;
        }

        if (lowerError.includes("téléphone") || lowerError.includes("phone")) {
          setError(
            "phone",
            {
              type: "manual",
              message: errorMessage,
            },
            { shouldFocus: true },
          );
          return;
        }
      }

      toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold">{"Paramètres"}</h1>
        <p className="text-muted-foreground">{"Configurez les informations de votre restaurant"}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {"Informations générales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{"Nom du restaurant"}</Label>
                <Input id="name" {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{"Téléphone"}</Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput defaultCountry="FR" value={field.value} onChange={field.onChange} placeholder="6 12 34 56 78" />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{"Email de contact"}</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contact@restaurant.fr" />
              {errors.email && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.email.message}
                </p>
              )}

              {!isEmailVerified && currentEmail && !errors.email && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <EmailVerificationSection email={currentEmail} onSuccess={() => setIsEmailVerified(true)} />
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir un email à chaque nouvelle réservation ou modification</p>
                </div>
                <Controller
                  control={control}
                  name="sendBookingEmail"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            </div>

            <div className={`space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4 relative overflow-hidden ${!hasBankImprint ? 'pointer-events-none' : ''}`}>
              {!hasBankImprint && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center pointer-events-auto">
                  <div className="bg-muted w-12 h-12 flex items-center justify-center rounded-full mb-3">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Fonctionnalité Verrouillée</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                    Passez à un abonnement supérieur pour activer l'empreinte bancaire.
                  </p>
                  <Button size="sm" onClick={() => navigate(`/restaurant/${id}/plan`)}>
                    Voir les abonnements
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Empreinte Bancaire
                    {watch("stripeConnectEnabled") ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        Configuré
                      </Badge>
                    ) : watch("stripeAccountId") ? (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                        En cours de validation
                      </Badge>
                    ) : null}
                  </Label>
                  <p className="text-sm text-muted-foreground">Exiger une empreinte bancaire lors de la réservation en ligne.</p>
                </div>
                <div className="flex items-center gap-4">
                  {watch("stripeAccountId") ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await api.post(`/restaurants/${id}/stripe-connect`);
                            window.location.href = res.data.url;
                          } catch (error: any) {
                            toast.error(error.response?.data?.error || "Erreur de connexion à Stripe");
                          }
                        }}
                      >
                        Gérer le compte
                      </Button>
                      <Controller
                        control={control}
                        name="isBankImprintEnabled"
                        render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                      />
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await api.post(`/restaurants/${id}/stripe-connect`);
                          window.location.href = res.data.url;
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || "Erreur de connexion à Stripe");
                        }
                      }}
                    >
                      Configurer Stripe
                    </Button>
                  )}
                </div>
              </div>

              {watch("isBankImprintEnabled") && (
                <div className="pt-4 border-t border-primary/10 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="bankImprintAmount">Montant par personne (€)</Label>
                    <div className="relative">
                      <Input
                        id="bankImprintAmount"
                        type="number"
                        {...register("bankImprintAmount")}
                        placeholder="Ex: 10"
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                    {errors.bankImprintAmount && (
                      <p className="text-xs font-medium text-red-500 mt-1">{errors.bankImprintAmount.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Sera bloqué via pré-autorisation Stripe. Aucun vrai débit sauf en cas de No-Show.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adress">{"Adresse"}</Label>
              <Controller
                control={control}
                name="adress"
                render={({ field }) => (
                  <AddressAutocomplete
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      // Reset validity on manual type
                      addressValid.current = false;
                      cityValid.current = false;
                    }}
                    onValidityChange={(isValid) => {
                      // This might be redundant if we handle it in onChange/onSelect effectively
                      // but good for clearing
                      addressValid.current = isValid;
                    }}
                    onSelect={(addr) => {
                      field.onChange(addr.address);
                      setValue("city", addr.city);
                      addressValid.current = true;
                      cityValid.current = true;
                      // Clear any error
                      clearErrors("adress");
                    }}
                    error={!!errors.adress}
                    placeholder="123 rue..."
                  />
                )}
                rules={{
                  validate: (value) => (value && addressValid.current) || "Veuillez sélectionner une adresse valide dans la liste",
                }}
              />
              {errors.adress && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.adress.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">{"Slogan / Phrase d'accroche"}</Label>
              <Input id="shortDescription" {...register("shortDescription")} placeholder="Une cuisine authentique..." maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{"Description"}</Label>
              <Textarea id="description" {...register("description")} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">{"Site web"}</Label>
                <Input id="website" {...register("website")} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  {"Capacité (Nombre de couverts)"}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full border border-muted-foreground/20">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-xs text-muted-foreground">
                        {hasTablePlan
                          ? "La capacité totale est calculée automatiquement à partir de la somme des sièges de toutes vos tables dans votre plan de salle."
                          : "Définissez le nombre maximum de couverts que votre restaurant peut accueillir simultanément."}
                      </p>
                    </PopoverContent>
                  </Popover>
                </Label>
                <div className="relative">
                  <Input
                    id="capacity"
                    type="number"
                    {...register("capacity", { valueAsNumber: true })}
                    disabled={hasTablePlan}
                    className={hasTablePlan ? "bg-muted cursor-not-allowed pr-10" : "pr-10"}
                  />
                  {hasTablePlan && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {hasTablePlan
                    ? "Géré automatiquement via le plan de salle"
                    : "Cette limite empêche de recevoir des réservations au-delà de la capacité de votre restaurant"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Identité & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Controller
                control={control}
                name="cuisineType"
                render={({ field }) => <CuisineSelector value={field.value} onChange={field.onChange} />}
              />

              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gamme de prix</Label>
                <Controller
                  control={control}
                  name="priceRange"
                  render={({ field }) => <PriceRangeControl value={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t">
              <div className="flex justify-between items-end">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Équipements</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Choix multiple
                </span>
              </div>
              <Controller
                control={control}
                name="features"
                render={({ field }: { field: any }) => (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {FEATURES_LIST.map((feature) => {
                      const Icon = feature.icon;
                      const isSelected = field.value?.includes(feature.value);
                      return (
                        <div
                          key={feature.id}
                          onClick={() => {
                            const current = field.value || [];
                            const updated = isSelected ? current.filter((f: string) => f !== feature.value) : [...current, feature.value];
                            field.onChange(updated);
                          }}
                          className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                            isSelected
                              ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                              : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm"
                          }`}
                        >
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`text-xs font-bold text-center transition-all ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {feature.value}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              />

              <div className="flex justify-between items-end pt-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Moyens de paiement</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Choix multiple
                </span>
              </div>
              <Controller
                control={control}
                name="paymentMethods"
                render={({ field }: { field: any }) => (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = field.value?.includes(method.value);
                      return (
                        <div
                          key={method.id}
                          onClick={() => {
                            const current = field.value || [];
                            const updated = isSelected ? current.filter((m: string) => m !== method.value) : [...current, method.value];
                            field.onChange(updated);
                          }}
                          className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                            isSelected
                              ? "border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20"
                              : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm"
                          }`}
                        >
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`text-xs font-bold text-center transition-all ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {method.value}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="space-y-4 pt-8 border-t">
              <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Share2 className="h-4 w-4" /> Réseaux sociaux
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 h-11" placeholder="Facebook URL" {...register("socials.facebook")} />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 h-11" placeholder="Instagram URL" {...register("socials.instagram")} />
                </div>
                <div className="relative">
                  <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 h-11" placeholder="Tiktok URL" {...register("socials.tiktok")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {"Horaires d'ouverture"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="openingHours"
              render={({ field }) => <OpeningHoursEditor value={field.value} onChange={field.onChange} />}
            />
          </CardContent>
        </Card>

        {/* Exceptional Closures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Umbrella className="h-5 w-5" />
              {"Fermetures Exceptionnelles"}
            </CardTitle>
            <CardDescription>
              {
                "Définissez les périodes pendant lesquelles votre restaurant sera fermé (vacances, travaux, etc.). Ces dates seront bloquées pour les réservations."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="exceptionalClosures"
              render={({ field }) => <ExceptionalClosuresEditor value={field.value} onChange={field.onChange} />}
            />
          </CardContent>
        </Card>

        {/* Widget Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {"Intégration"}
            </CardTitle>
            <CardDescription>{"Copiez ce code pour ajouter un bouton de réservation sur votre site web personnel"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const code = `<a href="${window.location.origin}/restaurants/infos/${id}" target="_blank" style="background-color: #2d5a43; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: sans-serif; font-weight: bold;">Réserver sur Couverto</a>`;
                    navigator.clipboard.writeText(code);
                    toast.success("Code copié dans le presse-papier");
                  }}
                >
                  <Files className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{`<a href="${window.location.origin}/restaurants/infos/${id}" 
                  target="_blank" 
                  style="background-color: #2d5a43; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: sans-serif; font-weight: bold;">
                  Réserver sur Couverto
                      </a>`}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              {"Ce code affichera un bouton 'Réserver sur Couverto' qui redirigera vos clients vers votre page de réservation."}
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {"Zone de danger"}
            </CardTitle>
            <CardDescription>{"Actions irréversibles ou ayant un impact majeur sur votre restaurant"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Close/Reopen Restaurant */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-background">
              <div>
                <h4 className="font-semibold">{isClosed ? "Rouvrir le restaurant" : "Fermer le restaurant"}</h4>
                <p className="text-sm text-muted-foreground">
                  {isClosed
                    ? "Réactive les réservations. Votre restaurant acceptera à nouveau les réservations."
                    : "Bloque les nouvelles réservations. Votre restaurant reste visible mais les clients ne peuvent plus réserver."}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant={isClosed ? "default" : "outline"}
                    className={isClosed ? "" : "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"}
                    disabled={toggling}
                  >
                    {toggling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                    {isClosed ? "Rouvrir" : "Fermer"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{isClosed ? "Rouvrir le restaurant ?" : "Fermer le restaurant ?"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isClosed
                        ? "Les clients pourront à nouveau effectuer des réservations."
                        : "Les clients ne pourront plus effectuer de réservations. Vous pourrez rouvrir à tout moment."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{"Annuler"}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleClosed}>{isClosed ? "Rouvrir" : "Fermer"}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Restaurant */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-background">
              <div>
                <h4 className="font-semibold text-destructive">{"Supprimer le restaurant"}</h4>
                <p className="text-sm text-muted-foreground">
                  {"Cette action est irréversible. Toutes les données seront définitivement effacées."}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={deleting}>
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    {"Supprimer"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{"Supprimer définitivement ?"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {"Cette action est irréversible. Toutes les réservations, données clients et paramètres seront perdus."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{"Annuler"}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRestaurant} className="bg-destructive hover:bg-destructive/90">
                      {"Supprimer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <Button type="submit" disabled={saving} size="lg" className="shadow-lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {"Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
};
