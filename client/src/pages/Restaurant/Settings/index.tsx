import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  { id: "terrace", value: "terrace", icon: Umbrella },
  { id: "wifi", value: "wifi", icon: Wifi },
  { id: "accessible", value: "accessible", icon: Accessibility },
  { id: "bar", value: "bar", icon: Beer },
  { id: "air_conditioning", value: "air_conditioning", icon: Wind },
  { id: "parking", value: "parking", icon: Car },
  { id: "pets_allowed", value: "pets_allowed", icon: Dog },
];

const PAYMENT_METHODS = [
  { id: "card", value: "card", icon: CreditCard },
  { id: "cash", value: "cash", icon: Banknote },
  { id: "apple_pay", value: "apple_pay", icon: Smartphone },
  { id: "google_pay", value: "google_pay", icon: Smartphone },
  { id: "tickets_restaurant", value: "tickets_restaurant", icon: Ticket },
  { id: "cheque", value: "cheque", icon: StickyNote },
  { id: "ancv", value: "ancv", icon: Ticket },
];

export const RestaurantSettings = () => {
  const { t } = useTranslation();
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
      toast.success(
        response.data.restaurant.isClosed
          ? t("pages.restaurant.settings.restaurant_closed")
          : t("pages.restaurant.settings.restaurant_reopened"),
      );
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("pages.restaurant.settings.error"));
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    setDeleting(true);
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success(t("pages.restaurant.settings.restaurant_deleted"));
      navigate("/account/restaurants");
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("pages.restaurant.settings.error"));
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (data: RestaurantInterface) => {
    setSaving(true);
    try {
      await api.put(`/restaurants/${id}/settings`, data);
      toast.success(t("pages.restaurant.settings.saved"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("pages.restaurant.settings.error"));
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
        <h1 className="text-3xl font-bold">{t("pages.restaurant.settings.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.settings.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t("pages.restaurant.settings.basic_info")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("pages.restaurant.settings.name")}</Label>
                <Input id="name" {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("pages.restaurant.settings.phone")}</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">{t("pages.restaurant.settings.short_description")}</Label>
              <Input id="shortDescription" {...register("shortDescription")} placeholder="Une cuisine authentique..." maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("pages.restaurant.settings.description")}</Label>
              <Textarea id="description" {...register("description")} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">{t("pages.restaurant.settings.website")}</Label>
                <Input id="website" {...register("website")} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">{t("pages.restaurant.settings.capacity")}</Label>
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
              Identity & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cuisine Type</Label>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                    Multiple possible
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
                          <p className="text-sm text-muted-foreground italic px-1 flex items-center h-8">Select cuisine types...</p>
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
                              placeholder="Search cuisines..."
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
                                  <span className="font-medium">
                                    {t("create.steps.identity.add_custom", "Add")} "{cuisineSearch}"
                                  </span>
                                  <Plus className="h-4 w-4" />
                                </button>
                              ) : CUISINES.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase())).length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground italic">
                                  {t("create.steps.identity.no_results", "Type to add a custom cuisine")}
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
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Price Range</Label>
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
                              {t(`create.steps.identity.price_options.${price.id}`)}
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
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Features</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Multiple possible
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
                            {t(`create.steps.details.options.${feature.id}`)}
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
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment Methods</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Multiple possible
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
                            {t(`create.steps.details.payment_options.${method.id}`)}
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
                <Share2 className="h-4 w-4" /> Social Networks
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
              {t("pages.restaurant.settings.images")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverImage">{t("pages.restaurant.settings.cover_image")}</Label>
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
              <Label>Gallery</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add image URL..."
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

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("pages.restaurant.settings.opening_hours")}
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
              {t("pages.restaurant.settings.danger_zone")}
            </CardTitle>
            <CardDescription>{t("pages.restaurant.settings.danger_zone_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Close/Reopen Restaurant */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-background">
              <div>
                <h4 className="font-semibold">
                  {isClosed ? t("pages.restaurant.settings.reopen_restaurant") : t("pages.restaurant.settings.close_restaurant")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isClosed ? t("pages.restaurant.settings.reopen_description") : t("pages.restaurant.settings.close_description")}
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
                    {isClosed ? t("pages.restaurant.settings.reopen") : t("pages.restaurant.settings.close")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isClosed ? t("pages.restaurant.settings.confirm_reopen_title") : t("pages.restaurant.settings.confirm_close_title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isClosed
                        ? t("pages.restaurant.settings.confirm_reopen_description")
                        : t("pages.restaurant.settings.confirm_close_description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleClosed}>
                      {isClosed ? t("pages.restaurant.settings.reopen") : t("pages.restaurant.settings.close")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Restaurant */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-background">
              <div>
                <h4 className="font-semibold text-destructive">{t("pages.restaurant.settings.delete_restaurant")}</h4>
                <p className="text-sm text-muted-foreground">{t("pages.restaurant.settings.delete_description")}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={deleting}>
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    {t("pages.restaurant.settings.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("pages.restaurant.settings.confirm_delete_title")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("pages.restaurant.settings.confirm_delete_description")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRestaurant} className="bg-destructive hover:bg-destructive/90">
                      {t("pages.restaurant.settings.delete")}
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
            {t("pages.restaurant.settings.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
