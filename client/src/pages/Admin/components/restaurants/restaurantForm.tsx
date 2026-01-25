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
import { CUISINES, PRICES, FEATURES_LIST, PAYMENT_METHODS } from "@/constants/restaurantResources";
import { RestaurantInterface } from "@/interfaces/Restaurant";

export const AdminRestaurantForm = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, control, reset, watch } = useForm<RestaurantInterface>({
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
        reset(response.data.restaurant);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
        navigate("/admin/restaurants");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRestaurant();
  }, [id, reset, navigate]);

  const onSubmit = async (data: RestaurantInterface) => {
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{"Slug (identifiant URL unique)"}</Label>
                <Input id="slug" {...register("slug")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{"Téléphone"}</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{"Email de contact"}</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adress">{"Adresse"}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="adress" {...register("adress")} className="pl-10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{"Ville"}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="city" {...register("city")} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">{"Capacité"}</Label>
                <Input id="capacity" type="number" {...register("capacity")} />
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
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Type de Cuisine</Label>
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
                      </div>

                      <Popover open={cuisineOpen} onOpenChange={setCuisineOpen}>
                        <PopoverTrigger asChild>
                          <div className="relative group cursor-text">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-11 pr-10 h-12 text-base"
                              placeholder="Rechercher des cuisines..."
                              value={cuisineSearch}
                              onChange={(e) => setCuisineSearch(e.target.value)}
                            />
                            <ChevronDown
                              className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform ${cuisineOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <div className="max-h-[300px] overflow-y-auto p-1">
                            {CUISINES.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase())).map((cuisine) => (
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
                                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted"
                              >
                                {cuisine}
                                {field.value?.includes(cuisine) && <Check className="h-3 w-3 text-primary" />}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gamme de prix</Label>
                <div className="grid grid-cols-5 gap-2">
                  <Controller
                    control={control}
                    name="priceRange"
                    render={({ field }: { field: any }) => (
                      <>
                        {PRICES.map((price) => (
                          <div
                            key={price.id}
                            onClick={() => field.onChange(price.value)}
                            className={`p-2 border-2 rounded-xl text-center cursor-pointer transition-all ${
                              field.value === price.value ? "border-primary bg-primary/5 text-primary" : "border-muted"
                            }`}
                          >
                            <span className="text-xs font-bold">{price.value}</span>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Équipements</Label>
              <Controller
                control={control}
                name="features"
                render={({ field }: { field: any }) => (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {FEATURES_LIST.map((feature) => {
                      const isSelected = field.value?.includes(feature.value);
                      return (
                        <div
                          key={feature.id}
                          onClick={() => {
                            const current = field.value || [];
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
