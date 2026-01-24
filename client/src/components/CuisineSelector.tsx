import { useState } from "react";
import { ChefHat, Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CuisineSelectorProps } from "@/interfaces/Components";

export const CUISINES = [
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

export const CuisineSelector = ({ value = [], onChange, className, variant = "default" }: CuisineSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCuisines = CUISINES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  const toggleCuisine = (cuisine: string) => {
    if (value.includes(cuisine)) {
      onChange(value.filter((c) => c !== cuisine));
    } else {
      onChange([...value, cuisine]);
    }
  };

  const addCustomCuisine = (cuisine: string) => {
    if (!value.includes(cuisine)) {
      onChange([...value, cuisine]);
    }
    setSearch("");
    setOpen(false);
  };

  // Shared List Render
  const renderList = () => (
    <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
      {filteredCuisines.length === 0 && search.trim() !== "" ? (
        <button
          type="button"
          onClick={() => addCustomCuisine(search.trim())}
          className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
        >
          <span className="font-medium">Ajouter "{search}"</span>
          <Plus className="h-4 w-4" />
        </button>
      ) : filteredCuisines.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground italic">Tapez pour ajouter une cuisine personnalisée</div>
      ) : (
        filteredCuisines.map((cuisine) => (
          <button
            key={cuisine}
            type="button"
            onClick={() => toggleCuisine(cuisine)}
            className="w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-all group text-left mb-0.5"
          >
            <span className={`transition-all ${value.includes(cuisine) ? "font-bold text-primary translate-x-1" : ""}`}>{cuisine}</span>
            <div
              className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                value.includes(cuisine)
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              }`}
            >
              {value.includes(cuisine) && <Check className="h-3 w-3" />}
            </div>
          </button>
        ))
      )}
    </div>
  );

  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between bg-background font-normal hover:bg-background ${
              !value.length && "text-muted-foreground"
            } ${className}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <ChefHat className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{value.length > 0 ? value.join(", ") : "Type de cuisine"}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl rounded-xl" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/30 border-none focus-visible:ring-1"
              />
            </div>
          </div>
          {renderList()}
        </PopoverContent>
      </Popover>
    );
  }

  // DEFAULT VARIANT (Wizard Style)
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-end">
        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Type de cuisine
        </Label>
        {value.length > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
            {value.length} sélectionnés
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
        {value.map((cuisine) => (
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
                toggleCuisine(cuisine);
              }}
              className="ml-2 p-0.5 rounded-full hover:bg-primary/40 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground italic px-1 flex items-center h-8">Sélectionner les types de cuisine...</p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="relative group cursor-text"
            onClick={() => {
              if (!open) setOpen(true);
            }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              className="pl-11 pr-10 h-12 text-base border-muted-foreground/20 focus:border-primary shadow-sm transition-all"
              placeholder="Rechercher des cuisines..."
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
              className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-300 pointer-events-none ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl rounded-2xl border-primary/10"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">{renderList()}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
