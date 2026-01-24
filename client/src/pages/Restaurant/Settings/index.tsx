import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import {
  Loader2,
  Save,
  ImageIcon,
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
  FileText,
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
import { RestaurantInterface } from "@/interfaces/Restaurant";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const CUISINES = [
  "Française",
  "Italienne",
  "Japonaise",
  "Chinoise",
  "Indienne",
  "Mexicaine",
  "Américaine",
  "Méditerranéenne",
  "Végétarienne",
  "Vegan",
  "Bistrot",
  "Gastronomique",
  "Fast Food",
  "Brasserie",
];

const PRICES = [
  { id: "vlow", value: "$" },
  { id: "low", value: "$$" },
  { id: "medium", value: "$$$" },
  { id: "high", value: "$$$$" },
  { id: "vhigh", value: "$$$$$" },
];

const FEATURES_LIST = [
  { id: "terrace", value: "Terrasse", icon: Umbrella },
  { id: "wifi", value: "Wifi", icon: Wifi },
  { id: "accessible", value: "Accès PMR", icon: Accessibility },
  { id: "bar", value: "Bar", icon: Beer },
  { id: "air_conditioning", value: "Climatisation", icon: Wind },
  { id: "parking", value: "Parking", icon: Car },
  { id: "pets_allowed", value: "Animaux acceptés", icon: Dog },
];

const PAYMENT_METHODS = [
  { id: "card", value: "Carte Bancaire", icon: CreditCard },
  { id: "cash", value: "Espèces", icon: Banknote },
  { id: "apple_pay", value: "Apple Pay", icon: Smartphone },
  { id: "google_pay", value: "Google Pay", icon: Smartphone },
  { id: "tickets_restaurant", value: "Tickets Restaurant", icon: Ticket },
  { id: "cheque", value: "Chèque", icon: StickyNote },
  { id: "ancv", value: "Chèque-Vacances (ANCV)", icon: Ticket },
];

export const RestaurantSettings = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const isFetched = useRef(false);

  const { register, handleSubmit, control, setValue, watch, reset } = useForm<RestaurantInterface>({
    defaultValues: {
      cuisineType: [],
      features: [],
      paymentMethods: [],
      images: [],
      socials: { facebook: "", instagram: "", tiktok: "" },
      openingHours: {},
    },
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newMenuUrl, setNewMenuUrl] = useState("");

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (isFetched.current) return;
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        reset(response.data.restaurant);
        setIsClosed(response.data.restaurant.isClosed || false);
        isFetched.current = true;
      } catch (error) {
        console.error("Failed to fetch restaurant", error);
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

  const onSubmit = async (data: RestaurantInterface) => {
    setSaving(true);
    try {
      await api.put(`/restaurants/${id}/settings`, data);
      toast.success("Modifications enregistrées");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (newImageUrl) {
      const current = watch("images") || [];
      setValue("images", [...current, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const current = watch("images") || [];
    const updated = [...current];
    updated.splice(index, 1);
    setValue("images", updated);
  };

  const addMenu = () => {
    if (newMenuUrl) {
      const current = watch("menu") || [];
      setValue("menu", [...current, newMenuUrl]);
      setNewMenuUrl("");
    }
  };

  const removeMenu = (index: number) => {
    const current = watch("menu") || [];
    const updated = [...current];
    updated.splice(index, 1);
    setValue("menu", updated);
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
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{"Email de contact"}</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contact@restaurant.fr" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adress">{"Adresse"}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="adress" {...register("adress")} placeholder="123 rue..." className="pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{"Ville"}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="city" {...register("city")} placeholder="Paris" className="pl-10" />
                </div>
              </div>
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
                <Label htmlFor="capacity">{"Capacité"}</Label>
                <Input id="capacity" type="number" {...register("capacity")} />
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
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Type de Cuisine</Label>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                    Choix multiple
                  </span>
                </div>
                <Controller
                  control={control}
                  name="cuisineType"
                  render={({ field }: { field: any }) => (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                        {field.value?.map((cuisine: string) => (
                          <Badge
                            key={cuisine}
                            variant="secondary"
                            className="pl-3 pr-2 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all group"
                          >
                            {cuisine}
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value.filter((x: string) => x !== cuisine))}
                              className="ml-2 p-0.5 rounded-full hover:bg-primary/40 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!field.value || field.value.length === 0) && (
                          <p className="text-sm text-muted-foreground italic px-1 flex items-center h-8">
                            Sélectionner les types de cuisine...
                          </p>
                        )}
                      </div>

                      <Popover open={cuisineOpen} onOpenChange={setCuisineOpen}>
                        <PopoverTrigger asChild>
                          <div
                            className="relative group cursor-text"
                            onClick={(e) => {
                              if (!cuisineOpen) setCuisineOpen(true);
                            }}
                          >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                            <Input
                              className="pl-11 pr-10 h-12 text-base border-muted-foreground/20 focus:border-primary shadow-sm transition-all"
                              placeholder="Rechercher des cuisines..."
                              value={cuisineSearch}
                              onChange={(e) => {
                                setCuisineSearch(e.target.value);
                                if (!cuisineOpen) setCuisineOpen(true);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!cuisineOpen) setCuisineOpen(true);
                              }}
                            />
                            <ChevronDown
                              className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-300 pointer-events-none ${cuisineOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl rounded-2xl border-primary/10"
                          align="start"
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <div className="flex flex-col">
                            <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                              {CUISINES.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase())).length === 0 &&
                              cuisineSearch.trim() !== "" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const trimmed = cuisineSearch.trim();
                                    if (trimmed) {
                                      const current = field.value || [];
                                      if (!current.includes(trimmed)) {
                                        field.onChange([...current, trimmed]);
                                      }
                                      setCuisineSearch("");
                                      setCuisineOpen(false);
                                    }
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
                                >
                                  <span className="font-medium">Ajouter "{cuisineSearch}"</span>
                                  <Plus className="h-4 w-4" />
                                </button>
                              ) : CUISINES.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase())).length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground italic">
                                  Rechercher pour ajouter une cuisine personnalisée
                                </div>
                              ) : (
                                CUISINES.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase())).map((cuisine) => (
                                  <button
                                    key={cuisine}
                                    type="button"
                                    onClick={() => {
                                      const current = field.value || [];
                                      if (current.includes(cuisine)) {
                                        field.onChange(current.filter((c: string) => c !== cuisine));
                                      } else {
                                        field.onChange([...current, cuisine]);
                                      }
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
                                  >
                                    <span
                                      className={`transition-all ${field.value?.includes(cuisine) ? "font-bold text-primary translate-x-1" : ""}`}
                                    >
                                      {cuisine}
                                    </span>
                                    <div
                                      className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                                        field.value?.includes(cuisine)
                                          ? "bg-primary border-primary text-primary-foreground"
                                          : "border-muted-foreground/30 group-hover:border-primary/50"
                                      }`}
                                    >
                                      {field.value?.includes(cuisine) && <Check className="h-3 w-3" />}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gamme de prix</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  <Controller
                    control={control}
                    name="priceRange"
                    render={({ field }: { field: any }) => (
                      <>
                        {PRICES.map((price) => (
                          <div
                            key={price.id}
                            onClick={() => field.onChange(price.value)}
                            className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                              field.value === price.value
                                ? "border-primary bg-primary/[0.03] shadow-[0_4px_12px_-4px_rgba(var(--primary),0.2)] ring-1 ring-primary/20"
                                : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm"
                            }`}
                          >
                            <div
                              className={`h-8 w-8 rounded-xl flex items-center justify-center mb-2 transition-colors duration-300 ${
                                field.value === price.value
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <span className="text-xs font-black tracking-tight">{price.value}</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold text-center transition-all duration-300 ${field.value === price.value ? "text-primary/95" : "text-muted-foreground"}`}
                            >
                              {price.id === "vlow"
                                ? "Économique"
                                : price.id === "low"
                                  ? "Abordable"
                                  : price.id === "medium"
                                    ? "Moyen"
                                    : price.id === "high"
                                      ? "Chic"
                                      : "Luxe"}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
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

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {"Images"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverImage">{"Image de couverture (URL)"}</Label>
              <div className="flex gap-4">
                <Input id="coverImage" {...register("coverImage")} placeholder="https://example.com/image.jpg" />
                {watch("coverImage") && (
                  <div className="w-20 h-10 rounded overflow-hidden">
                    <img src={watch("coverImage")} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Galerie</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une URL d'image..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                />
                <Button type="button" size="icon" onClick={addImage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {watch("images")?.map((img: string, idx: number) => (
                  <div key={idx} className="relative group aspect-video bg-muted rounded overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {"Menu"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com/menu.pdf"
                  value={newMenuUrl}
                  onChange={(e) => setNewMenuUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMenu())}
                  className="pl-10"
                />
              </div>
              <Button type="button" size="icon" onClick={addMenu}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {watch("menu")?.map((url: string, idx: number) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                return (
                  <div key={idx} className="relative group aspect-[3/4] bg-muted rounded-xl overflow-hidden border">
                    {isImage ? (
                      <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Menu" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground break-all px-2 line-clamp-3">{url.split("/").pop()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeMenu(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {(!watch("menu") || watch("menu")?.length === 0) && (
                <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6 opacity-30" />
                  <p className="text-sm">{"Aucun lien vers le menu"}</p>
                </div>
              )}
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
