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
import { Loader2, Save, ImageIcon, Clock, Utensils, Info, Share2, DollarSign } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

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
const FEATURES_LIST = ["Terrace", "Wifi", "Accessible", "Bar", "Air Conditioning", "Parking", "Pets Allowed"];
const PAYMENT_METHODS = ["Card", "Cash", "Apple Pay", "Google Pay", "Tickets Restaurant", "Cheque"];

export const RestaurantSettings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
              <Label htmlFor="shortDescription">Slogan / Phrase d'accroche</Label>
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
                <Label htmlFor="capacity">{t("pages.restaurant.settings.general.capacity")}</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cuisine Type</Label>
                <Controller
                  control={control}
                  name="cuisineType"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {field.value?.map((c) => (
                          <Badge key={c} variant="secondary">
                            {c}
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value.filter((x) => x !== c))}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(val) => !field.value?.includes(val) && field.onChange([...(field.value || []), val])}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add cuisine..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CUISINES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select value={watch("priceRange")} onValueChange={(val) => setValue("priceRange", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (Budget)</SelectItem>
                    <SelectItem value="$$">$$ (Moderate)</SelectItem>
                    <SelectItem value="$$$">$$$ (Upscale)</SelectItem>
                    <SelectItem value="$$$$">$$$$ (Premium)</SelectItem>
                    <SelectItem value="$$$$$">$$$$$ (Luxury)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURES_LIST.map((f) => (
                    <div key={f} className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name="features"
                        render={({ field }) => (
                          <Checkbox
                            id={`f-${f}`}
                            checked={field.value?.includes(f)}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange([...(field.value || []), f]);
                              else field.onChange(field.value?.filter((x) => x !== f));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`f-${f}`} className="text-sm cursor-pointer">
                        {f}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Methods</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <div key={m} className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name="paymentMethods"
                        render={({ field }) => (
                          <Checkbox
                            id={`p-${m}`}
                            checked={field.value?.includes(m)}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange([...(field.value || []), m]);
                              else field.onChange(field.value?.filter((x) => x !== m));
                            }}
                          />
                        )}
                      />
                      <label htmlFor={`p-${m}`} className="text-sm cursor-pointer">
                        {m}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Social Networks
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Facebook URL" {...register("socials.facebook")} />
                <Input placeholder="Instagram URL" {...register("socials.instagram")} />
                <Input placeholder="TikTok URL" {...register("socials.tiktok")} />
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
                {watch("images")?.map((img, idx) => (
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
