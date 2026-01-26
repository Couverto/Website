import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceRangeControl } from "@/components/customs/PriceRangeControl";
import { WizardData } from "../types";
import { Badge } from "@/components/ui/badge";
import { X, Search, Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { StepProps } from "@/interfaces/Components";
import { CUISINES } from "@/constants/restaurantResources";
import { CuisineSelector } from "@/components/CuisineSelector";

export const StepIdentity = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <CuisineSelector
          value={data.cuisineType}
          onChange={(value) => updateData({ cuisineType: value })}
          className={errors?.cuisineType ? "border-red-500 rounded-2xl overflow-hidden" : ""}
        />
        {errors?.cuisineType && (
          <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.cuisineType}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.priceRange ? "text-red-500" : ""}`}
        >
          {"Gamme de prix"}
        </Label>
        <PriceRangeControl
          value={data.priceRange}
          onChange={(val) => updateData({ priceRange: val as any })}
          error={!!errors?.priceRange}
        />
        {errors?.priceRange && <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.priceRange}</p>}
      </div>

      <div className="space-y-4">
        <Label
          htmlFor="shortDescription"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.shortDescription ? "text-red-500" : ""}`}
        >
          {"Phrase d'accroche"}
        </Label>
        <div className="relative group">
          <Input
            id="shortDescription"
            value={data.shortDescription || ""}
            onChange={(e) => updateData({ shortDescription: e.target.value })}
            placeholder={"Une cuisine authentique au coeur de Paris..."}
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
          {"Description complète"}
        </Label>
        <Textarea
          id="description"
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder={"Racontez l'histoire de votre restaurant..."}
          className={`min-h-[160px] text-base leading-relaxed p-4 transition-all ${errors?.description ? "border-red-500 bg-red-50/30" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
        />
        {errors?.description && (
          <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
};
