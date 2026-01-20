import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface StepProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  errors?: Record<string, string>;
}

export const StepMedia = ({ data, updateData, errors }: StepProps) => {
  const { t } = useTranslation();
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
          {t("create.steps.visuals.cover_image")}
        </Label>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-4">
            <div className="relative group">
              <ImageIcon
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.coverImage ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <Input
                placeholder="https://example.com/cover.jpg"
                value={(data.coverImage as string) || ""}
                onChange={(e) => updateData({ coverImage: e.target.value })}
                className={`pl-10 h-12 text-base transition-all ${errors?.coverImage ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
              />
            </div>
            {errors?.coverImage ? (
              <p className="text-xs font-medium text-red-500">{errors.coverImage}</p>
            ) : (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">{t("create.steps.visuals.cover_help")}</p>
              </div>
            )}
          </div>

          <div className="w-full md:w-64 aspect-[16/10] bg-muted/30 rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative group shadow-inner">
            {data.coverImage ? (
              <>
                <img
                  src={data.coverImage as string}
                  alt="Cover Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Badge className="bg-white/90 text-black border-none shadow-xl tracking-wider font-extrabold uppercase text-[10px]">
                    {t("create.steps.visuals.preview_badge")}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
                <ImageIcon className="h-10 w-10" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t("create.steps.visuals.no_cover_link")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t">
        <div className="flex justify-between items-end">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("create.steps.visuals.gallery")}
          </Label>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
            {t("create.steps.visuals.gallery_hint")}
          </span>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("create.steps.visuals.add_image") + "..."}
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              className="pl-10 h-12 border-muted-foreground/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <Button
            onClick={addImage}
            type="button"
            size="icon"
            className="h-12 w-12 rounded-xl shadow-lg hover:shadow-primary/20 transition-all shrink-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

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
                <p className="font-semibold text-foreground/80">{t("create.steps.visuals.no_images")}</p>
                <p className="text-xs opacity-50 max-w-[200px] mx-auto leading-relaxed">{t("create.steps.visuals.empty_description")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
