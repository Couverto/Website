import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardData } from "../types";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { X, Search, Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { StepProps } from "@/interfaces/Components";

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

export const StepIdentity = ({ data, updateData, errors }: StepProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCuisines = CUISINES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  const handleCuisineToggle = (cuisine: string) => {
    const current = data.cuisineType || [];
    const updated = current.includes(cuisine) ? current.filter((c: string) => c !== cuisine) : [...current, cuisine];
    updateData({ cuisineType: updated });
  };

  const removeCuisine = (cuisine: string) => {
    updateData({ cuisineType: data.cuisineType?.filter((c: string) => c !== cuisine) || [] });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Label
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.cuisineType ? "text-red-500" : ""}`}
          >
            {t("create.steps.identity.cuisine_type")}
          </Label>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
            Multiple possible
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
          {data.cuisineType?.map((cuisine: string) => (
            <Badge
              key={cuisine}
              variant="secondary"
              className="pl-3 pr-2 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all group"
            >
              {cuisine}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCuisine(cuisine);
                }}
                className="ml-2 p-0.5 rounded-full hover:bg-primary/40 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(!data.cuisineType || data.cuisineType.length === 0) && (
            <p className="text-sm text-muted-foreground italic px-1 flex items-center h-8">
              {t("create.steps.identity.placeholders.cuisine")}
            </p>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              className="relative group cursor-text"
              onClick={(e) => {
                // Prevent toggle behavior - only open, never close from trigger
                if (!open) {
                  setOpen(true);
                }
              }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
              <Input
                className={`pl-11 pr-10 h-12 text-base transition-all ${
                  errors?.cuisineType ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"
                }`}
                placeholder={t("create.steps.identity.placeholders.search_cuisine", "Select cuisines...")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!open) setOpen(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!open) setOpen(true);
                }}
              />
              <ChevronDown
                className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-300 pointer-events-none ${open ? "rotate-180" : ""}`}
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
                {filteredCuisines.length === 0 && search.trim() !== "" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = search.trim();
                      if (trimmed) {
                        const current = data.cuisineType || [];
                        if (!current.includes(trimmed)) {
                          updateData({ cuisineType: [...current, trimmed] });
                        }
                        setSearch("");
                        setOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
                  >
                    <span className="font-medium">
                      {t("create.steps.identity.add_custom", "Add")} "{search}"
                    </span>
                    <Plus className="h-4 w-4" />
                  </button>
                ) : filteredCuisines.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground italic">
                    {t("create.steps.identity.no_results", "Type to add a custom cuisine")}
                  </div>
                ) : (
                  filteredCuisines.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => handleCuisineToggle(cuisine)}
                      className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
                    >
                      <span
                        className={`transition-all ${data.cuisineType?.includes(cuisine) ? "font-bold text-primary translate-x-1" : ""}`}
                      >
                        {cuisine}
                      </span>
                      <div
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                          data.cuisineType?.includes(cuisine)
                            ? "bg-primary border-primary text-primary-foreground rotate-0 scale-100 shadow-md shadow-primary/20"
                            : "border-muted-foreground/30 group-hover:border-primary/50 rotate-90 scale-90"
                        }`}
                      >
                        {data.cuisineType?.includes(cuisine) && <Check className="h-3 w-3 transition-all animate-in zoom-in-50" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {errors?.cuisineType && (
          <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.cuisineType}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.priceRange ? "text-red-500" : ""}`}
        >
          {t("create.steps.identity.price_range")}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRICES.map((price) => (
            <div
              key={price.id}
              onClick={() => updateData({ priceRange: price.value as any })}
              className={`relative flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer select-none transition-all duration-300 group ${
                data.priceRange === price.value
                  ? "border-primary bg-primary/[0.03] shadow-[0_4px_12px_-4px_rgba(var(--primary),0.2)] ring-1 ring-primary/20"
                  : errors?.priceRange
                    ? "border-red-200 bg-red-50/50"
                    : "border-muted-foreground/10 hover:border-primary/40 hover:bg-primary/[0.02] shadow-sm hover:shadow-md"
              }`}
            >
              <div
                className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${data.priceRange === price.value ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground"}`}
              >
                <span className="text-sm font-black tracking-tight">{price.value}</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold transition-all duration-300 ${data.priceRange === price.value ? "text-primary/95" : "text-foreground/80 group-hover:text-foreground"}`}
                >
                  {t(`create.steps.identity.price_options.${price.id}`)}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-tight">
                  {price.id === "vlow"
                    ? "Budget"
                    : price.id === "low"
                      ? "Affordable"
                      : price.id === "medium"
                        ? "Standard"
                        : price.id === "high"
                          ? "Premium"
                          : "Luxury"}
                </span>
              </div>
            </div>
          ))}
        </div>
        {errors?.priceRange && <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.priceRange}</p>}
      </div>

      <div className="space-y-4">
        <Label
          htmlFor="shortDescription"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.shortDescription ? "text-red-500" : ""}`}
        >
          {t("create.steps.identity.short_description")}
        </Label>
        <div className="relative group">
          <Input
            id="shortDescription"
            value={data.shortDescription || ""}
            onChange={(e) => updateData({ shortDescription: e.target.value })}
            placeholder={t("create.steps.identity.placeholders.short_desc")}
            maxLength={100}
            className={`h-12 text-base transition-all ${errors?.shortDescription ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <span
              className={`text-[10px] font-bold ${data.shortDescription?.length === 100 ? "text-orange-500" : "text-muted-foreground/40"}`}
            >
              {data.shortDescription?.length || 0}/100
            </span>
          </div>
        </div>
        {errors?.shortDescription && (
          <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.shortDescription}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label
          htmlFor="description"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.description ? "text-red-500" : ""}`}
        >
          {t("create.steps.identity.description")}
        </Label>
        <Textarea
          id="description"
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder={t("create.steps.identity.placeholders.desc")}
          className={`min-h-[160px] text-base leading-relaxed p-4 transition-all ${errors?.description ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
        />
        {errors?.description && (
          <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
};
