import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { MapPin, Phone, Store } from "lucide-react";
import { StepProps } from "@/interfaces/Components";

export const StepEssentials = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.name ? "text-red-500" : ""}`}
          >
            {"Nom du restaurant"}
          </Label>
          <div className="relative group">
            <Store
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.name ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
            />
            <Input
              id="name"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              placeholder={"Le Gourmet"}
              className={`pl-10 h-12 text-base transition-all ${errors?.name ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
            />
          </div>
          {errors?.name && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="phone"
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.phone ? "text-red-500" : ""}`}
          >
            {"Téléphone"}
          </Label>
          <div className="relative group">
            <Phone
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.phone ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
            />
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder={"+33 1 23 45 67 89"}
              className={`pl-10 h-12 text-base transition-all ${errors?.phone ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
            />
          </div>
          {errors?.phone && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="adress"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.adress ? "text-red-500" : ""}`}
        >
          {"Adresse"}
        </Label>
        <div className="relative group">
          <MapPin
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.adress ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
          />
          <Input
            id="adress"
            value={data.adress}
            onChange={(e) => updateData({ adress: e.target.value })}
            placeholder={"123 Avenue des Champs-Elysées"}
            className={`pl-10 h-12 text-base transition-all ${errors?.adress ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
          />
        </div>
        {errors?.adress && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.adress}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="city"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.city ? "text-red-500" : ""}`}
        >
          {"Ville"}
        </Label>
        <div className="relative group">
          <MapPin
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${errors?.city ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary"}`}
          />
          <Input
            id="city"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            placeholder={"Paris"}
            className={`pl-10 h-12 text-base transition-all ${errors?.city ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
          />
        </div>
        {errors?.city && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.city}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="email"
          className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${errors?.email ? "text-red-500" : ""}`}
        >
          {"Email de contact"}
        </Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder={"contact@legourmet.fr"}
            className={`h-12 text-base transition-all ${errors?.email ? "border-red-500 bg-red-50/30 focus-visible:ring-red-500" : "border-muted-foreground/20 focus:border-primary shadow-sm"}`}
          />
        </div>
        {errors?.email && (
          <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
            <span className="w-1 h-1 rounded-full bg-red-500" /> {errors.email}
          </p>
        )}
      </div>
    </div>
  );
};
