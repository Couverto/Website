import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Utensils, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WizardData } from "../types";

interface PreviewProps {
  data: WizardData;
}

export const WizardPreview = ({ data }: PreviewProps) => {
  const { t } = useTranslation();

  return (
    <div className="sticky top-24 px-4 pb-8">
      <div className="flex flex-col items-center gap-1 mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
          {t("create.steps.preview.live_badge") || "Live Preview"}
        </span>
        <h4 className="text-sm font-semibold text-foreground/80">{t("create.steps.preview.title")}</h4>
      </div>

      <Card className="group relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(var(--primary),0.08)] h-full flex flex-col bg-card max-w-sm mx-auto rounded-[2rem]">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {data.coverImage ? (
            <img
              src={data.coverImage as string}
              alt={data.name || "Restaurant"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground/30">
              <Utensils className="h-16 w-16 opacity-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-white/95 text-black backdrop-blur-md border-none shadow-xl flex items-center gap-1.5 w-fit px-3 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider">{t("pages.home.card.new_badge") || "New"}</span>
            </Badge>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              {data.priceRange && (
                <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 uppercase tracking-tighter">
                  {t(
                    `create.steps.identity.price_options.${
                      data.priceRange === "$"
                        ? "vlow"
                        : data.priceRange === "$$"
                          ? "low"
                          : data.priceRange === "$$$"
                            ? "medium"
                            : data.priceRange === "$$$$"
                              ? "high"
                              : "vhigh"
                    }`,
                  )}
                </span>
              )}
              <div className="h-1 w-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] font-medium text-white/80">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="truncate">{data.city || "City"}</span>
              </div>
            </div>
            <h3 className="font-black text-2xl leading-tight text-white drop-shadow-md truncate tracking-tight">
              {data.name || "Restaurant Name"}
            </h3>
          </div>
        </div>

        <CardContent className="p-6 flex-1 flex flex-col pt-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.cuisineType?.slice(0, 3).map((type: string, i: number) => (
              <Badge
                key={i}
                variant="secondary"
                className="font-bold text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-none hover:bg-primary/10 transition-colors px-2 py-1"
              >
                {type}
              </Badge>
            ))}
            {(!data.cuisineType || data.cuisineType.length === 0) && (
              <Badge
                variant="secondary"
                className="font-medium text-[10px] uppercase tracking-wider bg-muted/40 text-muted-foreground/60 border-none px-2 py-1 italic"
              >
                {t("create.steps.preview.placeholder_cuisine")}
              </Badge>
            )}
          </div>

          <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed line-clamp-2 mb-6 italic">
            "{data.shortDescription || t("create.steps.preview.placeholder_slogan")}"
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {data.features?.slice(0, 3).map((f: string) => (
              <div
                key={f}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-muted-foreground/5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
              >
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                {t(`create.steps.details.options.${f}`)}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100 shadow-inner mt-auto">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            {t("pages.home.card.availability_today")}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
            disabled
          >
            {t("pages.home.card.book_button")}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-10 p-6 rounded-3xl bg-muted/30 border border-muted-foreground/5 backdrop-blur-sm text-[10px] text-muted-foreground/60 space-y-3 shadow-inner">
        <div className="flex justify-between items-center pb-2 border-b border-muted-foreground/5">
          <span className="font-bold uppercase tracking-widest">{t("create.steps.preview.status")}:</span>
          <Badge
            variant="outline"
            className={`border-none ${data.name ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"} font-black uppercase tracking-tighter text-[9px]`}
          >
            {data.name ? t("create.steps.preview.in_progress") : t("create.steps.preview.not_started")}
          </Badge>
        </div>
        <p className="leading-relaxed">
          <strong className="uppercase tracking-widest font-black mr-2">{t("create.steps.preview.steps_label")}:</strong>
          <span className="font-medium">{t("create.steps.preview.steps_list")}</span>
        </p>
      </div>
    </div>
  );
};
