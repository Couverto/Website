import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
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
import {
  Loader2,
  Save,
  ImageIcon,
  Clock,
  Utensils,
  Info,
  DollarSign,
  X,
  Plus,
  Search,
  Check,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Users,
  Share2,
  Wallet,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RestaurantSettingsForm {
  name: string;
  description?: string;
  shortDescription?: string;
  phone: string;
  website?: string;
  priceRange: string;
  cuisineType: string[];
  features: string[];
  paymentMethods: string[];
  capacity: number;
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  coverImage?: string;
  images: string[];
  openingHours: Record<string, string>;
}

interface RestaurantContext {
  restaurant: any;
}

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
  { id: "terrace", value: "terrace" },
  { id: "wifi", value: "wifi" },
  { id: "accessible", value: "accessible" },
  { id: "bar", value: "bar" },
  { id: "air_conditioning", value: "air_conditioning" },
  { id: "parking", value: "parking" },
  { id: "pets_allowed", value: "pets_allowed" },
];

const PAYMENT_METHODS = [
  { id: "card", value: "card" },
  { id: "cash", value: "cash" },
  { id: "apple_pay", value: "apple_pay" },
  { id: "google_pay", value: "google_pay" },
  { id: "tickets_restaurant", value: "tickets_restaurant" },
  { id: "cheque", value: "cheque" },
];

export const RestaurantSettings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset } = useForm<RestaurantSettingsForm>({
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
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        reset(response.data.restaurant);
      } catch (error) {
        console.error("Failed to fetch restaurant", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRestaurant();
  }, [id, reset]);

  const onSubmit = async (data: RestaurantSettingsForm) => {
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

                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full h-12 justify-between text-base font-normal px-4 border-muted-foreground/20 focus:border-primary shadow-sm hover:border-primary/50 transition-all"
                          >
                            <div className="flex items-center gap-2 text-muted-foreground italic">
                              <Search className="h-4 w-4" />
                              <span>Search cuisines...</span>
                            </div>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 shadow-2xl rounded-2xl border-primary/10" align="start">
                          <div className="flex flex-col">
                            <div className="p-3 border-b flex items-center gap-2 sticky top-0 bg-background z-10">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <input
                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                              {CUISINES.filter((c) => c.toLowerCase().includes(search.toLowerCase())).map((cuisine) => (
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
                              ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Features</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Controller
                    control={control}
                    name="features"
                    render={({ field }: { field: any }) => (
                      <>
                        {FEATURES_LIST.map((feature) => (
                          <div
                            key={feature.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-primary/[0.04] hover:border-primary/20 ${field.value?.includes(feature.value) ? "border-primary/30 bg-primary/[0.02]" : "border-transparent"}`}
                            onClick={() => {
                              const current = field.value || [];
                              if (current.includes(feature.value)) {
                                field.onChange(current.filter((f: string) => f !== feature.value));
                              } else {
                                field.onChange([...current, feature.value]);
                              }
                            }}
                          >
                            <Checkbox
                              id={`feat-${feature.id}`}
                              checked={field.value?.includes(feature.value)}
                              className="rounded-md h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                            />
                            <label htmlFor={`feat-${feature.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                              {t(`create.steps.details.options.${feature.id}`)}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payment Methods</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Controller
                    control={control}
                    name="paymentMethods"
                    render={({ field }: { field: any }) => (
                      <>
                        {PAYMENT_METHODS.map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-primary/[0.04] hover:border-primary/20 ${field.value?.includes(method.value) ? "border-primary/30 bg-primary/[0.02]" : "border-transparent"}`}
                            onClick={() => {
                              const current = field.value || [];
                              if (current.includes(method.value)) {
                                field.onChange(current.filter((m: string) => m !== method.value));
                              } else {
                                field.onChange([...current, method.value]);
                              }
                            }}
                          >
                            <Checkbox
                              id={`pay-${method.id}`}
                              checked={field.value?.includes(method.value)}
                              className="rounded-md h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                            />
                            <label htmlFor={`pay-${method.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                              {t(`create.steps.details.payment_options.${method.id}`)}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
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
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10 h-11" placeholder="TikTok URL" {...register("socials.tiktok")} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-24 capitalize">{t(`pages.restaurant.settings.days.${day}`)}</Label>
                  <Input placeholder="09:00 - 22:00" {...register(`openingHours.${day}`)} />
                </div>
              ))}
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
