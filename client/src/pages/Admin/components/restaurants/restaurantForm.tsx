import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAdminUpdateRestaurantSchema } from "@/lib/zod/schemas/admin/zod";
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
  Music2,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRICES, FEATURES_LIST, PAYMENT_METHODS } from "@/constants/restaurantResources";
import { z } from "zod";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { PriceRangeControl } from "@/components/customs/PriceRangeControl";

type RestaurantFormValues = z.infer<ReturnType<typeof getAdminUpdateRestaurantSchema>>;
import { CuisineSelector } from "@/components/CuisineSelector";
import { PhoneInput } from "@/components/customs/phoneInput";

export const AdminRestaurantForm = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(getAdminUpdateRestaurantSchema()),
    defaultValues: {
      cuisineType: [],
      features: [],
      paymentMethods: [],
      images: [],
      socials: { facebook: "", instagram: "", tiktok: "" },
      openingHours: {},
    },
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}/details`);
        reset(response.data.restaurant as any);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
        navigate("/admin/restaurants");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRestaurant();
  }, [id, reset, navigate]);

  const onSubmit = async (data: RestaurantFormValues) => {
    setSaving(true);
    try {
      // Use the generic update route instead of settings-specific one if needed,
      // but settings one is already quite complete
      await api.put(`/restaurants/${id}`, data);
      toast.success("Modifications enregistrées");
      navigate("/admin/restaurants");
    } catch (error: any) {
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/restaurants")} className="rounded-full shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{"Modifier le restaurant"}</h1>
          <p className="text-muted-foreground">{"Édition administrative des informations"}</p>
        </div>
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
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{"Slug (identifiant URL unique)"}</Label>
                <Input id="slug" {...register("slug")} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{"Téléphone"}</Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput defaultCountry="FR" value={field.value} onChange={field.onChange} placeholder="6 12 34 56 78" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{"Email de contact"}</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adress">{"Adresse"}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="adress" {...register("adress")} className="pl-10" />
              </div>
              {errors.adress && <p className="text-sm text-destructive">{errors.adress.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{"Ville"}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="city" {...register("city")} className="pl-10" />
                </div>
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">{"Slogan / Phrase d'accroche"}</Label>
              <Input id="shortDescription" {...register("shortDescription")} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{"Description"}</Label>
              <Textarea id="description" {...register("description")} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{"Site web"}</Label>
              <Input id="website" {...register("website")} placeholder="https://" />
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
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
                <Controller
                  control={control}
                  name="cuisineType"
                  render={({ field }) => <CuisineSelector value={field.value || []} onChange={field.onChange} />}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gamme de prix</Label>
                <Controller
                  control={control}
                  name="priceRange"
                  render={({ field }) => <PriceRangeControl value={field.value || "$"} onChange={field.onChange} />}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Équipements</Label>
              <Controller
                control={control}
                name="features"
                render={({ field }) => (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {FEATURES_LIST.map((feature) => {
                      const isSelected = field.value?.includes(feature.value);
                      return (
                        <div
                          key={feature.id}
                          onClick={() => {
                            const current = (field.value as string[]) || [];
                            field.onChange(isSelected ? current.filter((f: string) => f !== feature.value) : [...current, feature.value]);
                          }}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 ${
                            isSelected ? "border-primary bg-primary/5 text-primary" : "border-muted"
                          }`}
                        >
                          <feature.icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{feature.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Share2 className="h-4 w-4" /> Réseaux sociaux
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Facebook URL" {...register("socials.facebook")} />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Instagram URL" {...register("socials.instagram")} />
                </div>
                <div className="relative">
                  <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Tiktok URL" {...register("socials.tiktok")} />
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/restaurants")} size="lg">
            Annuler
          </Button>
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {"Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
};
