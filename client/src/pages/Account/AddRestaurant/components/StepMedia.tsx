import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { StepProps } from "@/interfaces/Components";
import { ImageUpload } from "@/components/ImageUpload";
import { MediaInput } from "@/components/MediaInput";

export const StepMedia = ({ data, updateData, errors }: StepProps) => {
  const [newImageUrl, setNewImageUrl] = useState("");

  const addImage = () => {
    if (newImageUrl) {
      updateData({ images: [...(data.images || []), newImageUrl] });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(data.images || [])];
    newImages.splice(index, 1);
    updateData({ images: newImages });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <Label
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.coverImage ? "text-red-500" : ""}`}
        >
          {"Image de couverture"}
        </Label>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-4">
            <MediaInput
              onFileChange={(url) => updateData({ coverImage: url })}
              onUrlChange={(url) => updateData({ coverImage: url })}
              urlValue={(data.coverImage as string) || ""}
              placeholder="Image de couverture"
              aspectRatio="wide"
              endpoint="/uploads/restaurants/cover"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t">
        <div className="flex justify-between items-end">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{"Galerie photos"}</Label>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
            {"Jusqu'à 8 photos"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border rounded-2xl bg-muted/5">
            <h4 className="font-medium text-sm">Ajouter une photo</h4>
            <MediaInput
              onFileChange={(url) => {
                if (url) updateData({ images: [...(data.images || []), url] });
              }}
              onUrlChange={(url) => setNewImageUrl(url)}
              onUrlSubmit={addImage}
              urlValue={newImageUrl}
              placeholder="Photo de la galerie"
              endpoint="/uploads/restaurants/gallery"
            />
            <div className="p-3 bg-muted/30 rounded-xl border border-muted-foreground/10 text-xs text-muted-foreground">
              <p>Jusqu'à 8 images. Formats JPG, PNG, WEBP.</p>
            </div>
          </div>
          <div className="space-y-4 p-4 border rounded-2xl bg-muted/5 flex flex-col justify-center items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Conseil Pro</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Les restaurants avec de belles photos reçoivent jusqu'à 2x plus de réservations. Mettez en avant vos plats signatures et
                l'ambiance de la salle.
              </p>
            </div>
          </div>
        </div>
        {errors?.images && <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1 mt-2">{errors.images}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {data.images?.map((img: string, idx: number) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-2xl overflow-hidden bg-muted border border-muted-foreground/10 shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={img as string}
                alt={`Gallery ${idx}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-white/90 text-destructive hover:bg-destructive hover:text-white rounded-full p-2 shadow-lg transition-all scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {(!data.images || data.images.length === 0) && (
            <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center border-4 border-background shadow-inner">
                <ImageIcon className="h-8 w-8 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground/80">{"Aucune image ajoutée pour le moment."}</p>
                <p className="text-xs opacity-50 max-w-[200px] mx-auto leading-relaxed">
                  {"Les images permettent à votre restaurant de se démarquer. Ajoutez des liens vers vos photos."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
