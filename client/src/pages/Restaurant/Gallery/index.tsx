import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { axiosConfig as api } from "@/config/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loader2, ImageIcon, FileText, Trash2, X } from "lucide-react";
import { RestaurantInterface } from "@/interfaces/Restaurant";
import { MediaInput } from "@/components/MediaInput";

export const RestaurantGallery = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const isFetched = useRef(false);

  // We use useForm mainly to hold the state and easy watch/setValue access
  const { setValue, watch, reset } = useForm<RestaurantInterface>({
    defaultValues: {
      images: [],
      menu: [],
      coverImage: "",
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
        isFetched.current = true;
      } catch (error) {
        console.error("Failed to fetch restaurant", error);
        toast.error("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRestaurant();
  }, [id, reset]);

  // Reusing the auto-save logic from Settings
  const handleAutoSave = async (field: keyof RestaurantInterface, value: any) => {
    const previousValue = watch(field);
    try {
      // Optimistic update
      setValue(field, value);

      // API update (we reuse the settings endpoint as it handles partial updates)
      const updateData = { [field]: value };
      await api.put(`/restaurants/${id}/settings`, updateData);
      toast.success("Modifications enregistrées");
    } catch (error: any) {
      // Revert optimization
      setValue(field, previousValue);
      // Backend now sends explicit 400 errors for limits, so we show them directly
      toast.error(error.response?.data?.error || "Erreur lors de la sauvegarde automatique");
    }
  };

  const addImage = async () => {
    if (newImageUrl) {
      const current = watch("images") || [];
      const newImages = [...current, newImageUrl];
      await handleAutoSave("images", newImages);
      setNewImageUrl("");
    }
  };

  const removeImage = async (index: number) => {
    const current = watch("images") || [];
    const updated = [...current];
    updated.splice(index, 1);
    await handleAutoSave("images", updated);
  };

  const addMenu = async () => {
    if (newMenuUrl) {
      const current = watch("menu") || [];
      const newMenu = [...current, newMenuUrl];
      await handleAutoSave("menu", newMenu);
      setNewMenuUrl("");
    }
  };

  const removeMenu = async (index: number) => {
    const current = watch("menu") || [];
    const updated = [...current];
    updated.splice(index, 1);
    await handleAutoSave("menu", updated);
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
        <h1 className="text-3xl font-bold">{"Galerie & Médias"}</h1>
        <p className="text-muted-foreground">{"Gérez les photos et les menus de votre restaurant"}</p>
      </div>

      <div className="grid gap-8">
        {/* MEDIA SECTION (Moved from Settings) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {"Gestion des Médias"}
            </CardTitle>
            <CardDescription>{"Modifiez la photo de couverture, la galerie et le menu de votre établissement."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-12">
            {/* Cover Image */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Image de couverture</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <MediaInput
                  onFileChange={(url) => handleAutoSave("coverImage", url)}
                  onUrlChange={(url) => handleAutoSave("coverImage", url)}
                  urlValue={watch("coverImage") || ""}
                  placeholder="Image de couverture"
                  aspectRatio="wide"
                  endpoint="/uploads/restaurants/cover"
                />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest pl-1">Aperçu actuel</Label>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border shadow-sm group">
                    {watch("coverImage") ? (
                      <>
                        <img
                          src={watch("coverImage")}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt="Cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAutoSave("coverImage", "")}
                            className="translate-y-4 group-hover:translate-y-0 transition-transform"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Galerie Photos</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Max 8 photos
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest pl-1 mb-2 block">
                    Ajouter une photo
                  </Label>
                  <MediaInput
                    onFileChange={(url) => {
                      if (url) {
                        const current = watch("images") || [];
                        handleAutoSave("images", [...current, url]);
                      }
                    }}
                    onUrlChange={(url) => setNewImageUrl(url)}
                    onUrlSubmit={addImage}
                    urlValue={newImageUrl}
                    placeholder="Photo de la galerie"
                    endpoint="/uploads/restaurants/gallery"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest pl-1">Photos actuelles</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {watch("images")?.map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group aspect-square bg-muted rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all"
                      >
                        <img src={url} className="w-full h-full object-cover" alt="Gallery" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {(!watch("images") || watch("images")?.length === 0) && (
                      <div className="col-span-full py-8 text-center text-muted-foreground italic text-xs border-2 border-dashed rounded-xl">
                        Aucune image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Menu & Carte</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                  Max 8 pages
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest pl-1 mb-2 block">
                    Ajouter une page
                  </Label>
                  <MediaInput
                    onFileChange={(url) => {
                      if (url) {
                        const current = watch("menu") || [];
                        handleAutoSave("menu", [...current, url]);
                      }
                    }}
                    onUrlChange={(url) => setNewMenuUrl(url)}
                    onUrlSubmit={addMenu}
                    urlValue={newMenuUrl}
                    placeholder="Menu (PDF/Image)"
                    endpoint="/uploads/restaurants/menu"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest pl-1">Pages du menu</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {watch("menu")?.map((url: string, idx: number) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                      return (
                        <div
                          key={idx}
                          className="relative group aspect-[3/4] bg-muted rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
                        >
                          {isImage ? (
                            <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Menu" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center gap-1 bg-muted/50">
                              <FileText className="h-6 w-6 text-primary/50" />
                              <span className="text-[8px] font-mono text-muted-foreground break-all px-1 line-clamp-2">
                                {url.split("/").pop()}
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => removeMenu(idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {(!watch("menu") || watch("menu")?.length === 0) && (
                      <div className="col-span-full py-8 text-center text-muted-foreground italic text-xs border-2 border-dashed rounded-xl">
                        Aucun menu
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
