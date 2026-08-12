import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FieldLabel, SaveButton, TextField } from "./fields";
import { Restaurant } from "../../types";

const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"];

export interface GeneralFormValues {
  name: string;
  description: string;
  phone: string;
  adress: string;
  city: string;
  website: string;
  priceRange: string;
}

interface GeneralSectionProps {
  restaurant: Restaurant;
  values: GeneralFormValues;
  onChange: <K extends keyof GeneralFormValues>(field: K, value: GeneralFormValues[K]) => void;
  onToggleClosed: () => void;
  isTogglingClosed: boolean;
  onSave: () => void;
  isSaving: boolean;
}

export function GeneralSection({ restaurant, values, onChange, onToggleClosed, isTogglingClosed, onSave, isSaving }: Readonly<GeneralSectionProps>) {
  return (
    <View>
      <Pressable
        onPress={onToggleClosed}
        disabled={isTogglingClosed}
        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 mb-4 ${
          restaurant.isClosed ? "bg-red-50 border-danger/30" : "bg-success-bg border-success/20"
        }`}
      >
        <View className="flex-row items-center gap-2.5">
          <Feather name={restaurant.isClosed ? "x-circle" : "check-circle"} size={18} color={restaurant.isClosed ? "#d32f2f" : "#166534"} />
          <Text className={`font-bold text-sm ${restaurant.isClosed ? "text-danger" : "text-success"}`}>
            {restaurant.isClosed ? "Restaurant fermé aux réservations" : "Restaurant ouvert aux réservations"}
          </Text>
        </View>
        {isTogglingClosed ? <ActivityIndicator size="small" /> : <Feather name="chevron-right" size={18} color="#9ca3af" />}
      </Pressable>

      <TextField label="Nom" value={values.name} onChangeText={(v) => onChange("name", v)} />
      <TextField label="Description" value={values.description} onChangeText={(v) => onChange("description", v)} multiline />
      <TextField label="Téléphone" value={values.phone} onChangeText={(v) => onChange("phone", v)} keyboardType="phone-pad" />
      <TextField label="Adresse" value={values.adress} onChangeText={(v) => onChange("adress", v)} />
      <TextField label="Ville" value={values.city} onChangeText={(v) => onChange("city", v)} />
      <TextField label="Site web" value={values.website} onChangeText={(v) => onChange("website", v)} keyboardType="url" />

      <View className="mb-4">
        <FieldLabel>Gamme de prix</FieldLabel>
        <View className="flex-row gap-2">
          {PRICE_RANGES.map((p) => (
            <Pressable
              key={p}
              onPress={() => onChange("priceRange", p)}
              className={`flex-1 items-center py-2.5 rounded-xl border ${values.priceRange === p ? "bg-primary border-primary" : "bg-white border-border"}`}
            >
              <Text className={`font-bold text-sm ${values.priceRange === p ? "text-white" : "text-muted"}`}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SaveButton onPress={onSave} isSaving={isSaving} />
    </View>
  );
}
