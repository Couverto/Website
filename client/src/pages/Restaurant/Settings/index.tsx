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
import { toast } from "sonner";
import { Loader2, Save, ImageIcon, Clock } from "lucide-react";
import { useForm } from "react-hook-form";

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  phone: string;
  website?: string;
  coverImage?: string;
  images: string[];
  openingHours: Record<string, string>;
  cuisineType: string[];
  priceRange: string;
}

interface RestaurantContext {
  restaurant: Restaurant;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const RestaurantSettings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<Restaurant>>();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        setRestaurant(response.data.restaurant);
        reset(response.data.restaurant);
      } catch (error) {
        console.error("Failed to fetch restaurant", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id, reset]);

  const onSubmit = async (data: Partial<Restaurant>) => {
    setSaving(true);
    try {
      const response = await api.put(`/restaurants/${id}/settings`, data);
      setRestaurant(response.data.restaurant);
      toast.success(t("pages.restaurant.settings.saved"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("pages.restaurant.settings.error"));
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pages.restaurant.settings.title")}</h1>
        <p className="text-muted-foreground">{t("pages.restaurant.settings.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.restaurant.settings.basic_info")}</CardTitle>
            <CardDescription>{t("pages.restaurant.settings.basic_info_desc")}</CardDescription>
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
              <Label htmlFor="description">{t("pages.restaurant.settings.description")}</Label>
              <Textarea id="description" {...register("description")} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">{t("pages.restaurant.settings.website")}</Label>
                <Input id="website" {...register("website")} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRange">{t("pages.restaurant.settings.price_range")}</Label>
                <Select value={watch("priceRange")} onValueChange={(value) => setValue("priceRange", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - {t("pages.restaurant.settings.budget")}</SelectItem>
                    <SelectItem value="$$">$$ - {t("pages.restaurant.settings.moderate")}</SelectItem>
                    <SelectItem value="$$$">$$$ - {t("pages.restaurant.settings.upscale")}</SelectItem>
                  </SelectContent>
                </Select>
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
            <CardDescription>{t("pages.restaurant.settings.images_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverImage">{t("pages.restaurant.settings.cover_image")}</Label>
              <Input id="coverImage" {...register("coverImage")} placeholder="https://example.com/image.jpg" />
              {watch("coverImage") && <img src={watch("coverImage")} alt="Cover" className="mt-2 h-32 w-full object-cover rounded-lg" />}
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
            <CardDescription>{t("pages.restaurant.settings.opening_hours_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-24 capitalize">{t(`pages.restaurant.settings.days.${day}`)}</Label>
                  <Input
                    placeholder="09:00 - 22:00"
                    defaultValue={restaurant?.openingHours?.[day] || ""}
                    onChange={(e) => {
                      const current = watch("openingHours") || {};
                      setValue("openingHours", { ...current, [day]: e.target.value });
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t("pages.restaurant.settings.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
