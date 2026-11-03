import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useToggleRestaurantClosed, useUpdateRestaurantSettings } from "../../../src/hooks/useRestaurantSettings";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { GeneralSection, GeneralFormValues } from "../../../src/components/settings/GeneralSection";
import { HoursSection, ClosureDraft } from "../../../src/components/settings/HoursSection";
import { DaySchedule, OpeningPeriod } from "../../../src/types";
import { getApiErrorMessage } from "../../../src/api/client";

const makeId = () => Math.random().toString(36).slice(2);

export default function SettingsScreen() {
  const { activeRestaurantId, restaurant } = useRestaurant();
  const [section, setSection] = useState<"general" | "hours">("general");
  const updateSettings = useUpdateRestaurantSettings(activeRestaurantId);
  const toggleClosed = useToggleRestaurantClosed(activeRestaurantId);

  const [general, setGeneral] = useState<GeneralFormValues>({
    name: restaurant?.name ?? "",
    description: restaurant?.description ?? "",
    phone: restaurant?.phone ?? "",
    adress: restaurant?.adress ?? "",
    city: restaurant?.city ?? "",
    website: restaurant?.website ?? "",
    priceRange: restaurant?.priceRange ?? "€€",
  });

  const [openingHours, setOpeningHours] = useState<Record<string, DaySchedule>>(restaurant?.openingHours ?? {});
  const [closures, setClosures] = useState<ClosureDraft[]>(
    (restaurant?.exceptionalClosures ?? []).map((c) => ({ id: makeId(), startDate: c.startDate.slice(0, 10), endDate: c.endDate.slice(0, 10), reason: c.reason })),
  );

  if (!restaurant) return null;

  const saveGeneral = () => {
    updateSettings.mutate(general, {
      onSuccess: () => Alert.alert("Paramètres enregistrés"),
      onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)),
    });
  };

  const saveHours = () => {
    const isoClosures = closures
      .filter((c) => c.startDate && c.endDate)
      .map((c) => ({ startDate: `${c.startDate}T00:00:00.000Z`, endDate: `${c.endDate}T23:59:59.999Z`, reason: c.reason }));
    updateSettings.mutate(
      { openingHours, exceptionalClosures: isoClosures },
      {
        onSuccess: () => Alert.alert("Horaires enregistrés"),
        onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)),
      },
    );
  };

  const confirmToggleClosed = () => {
    const closing = !restaurant.isClosed;
    Alert.alert(
      closing ? "Fermer le restaurant ?" : "Rouvrir le restaurant ?",
      closing ? "Vous ne recevrez plus de nouvelles réservations tant qu'il est fermé." : undefined,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: closing ? "Fermer" : "Rouvrir",
          style: closing ? "destructive" : "default",
          onPress: () => toggleClosed.mutate(undefined, { onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)) }),
        },
      ],
    );
  };

  const setDayClosed = (day: string, isClosed: boolean) => {
    setOpeningHours((prev) => ({ ...prev, [day]: { periods: prev[day]?.periods ?? [], isClosed } }));
  };

  const addPeriod = (day: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { isClosed: false, periods: [...(prev[day]?.periods ?? []), { open: "12:00", close: "14:00" }] },
    }));
  };

  const removePeriod = (day: string, index: number) => {
    setOpeningHours((prev) => ({ ...prev, [day]: { ...prev[day], periods: prev[day].periods.filter((_, i) => i !== index) } }));
  };

  const updatePeriod = (day: string, index: number, field: keyof OpeningPeriod, value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], periods: prev[day].periods.map((p, i) => (i === index ? { ...p, [field]: value } : p)) },
    }));
  };

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <View className="flex-row gap-2 py-3">
        {(["general", "hours"] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setSection(key)}
            className={`flex-1 items-center py-2.5 rounded-xl border ${section === key ? "bg-primary border-primary" : "bg-white border-border"}`}
          >
            <Text className={`text-sm font-bold ${section === key ? "text-white" : "text-muted"}`}>
              {key === "general" ? "Général" : "Horaires"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {section === "general" ? (
          <GeneralSection
            restaurant={restaurant}
            values={general}
            onChange={(field, value) => setGeneral((prev) => ({ ...prev, [field]: value }))}
            onToggleClosed={confirmToggleClosed}
            isTogglingClosed={toggleClosed.isPending}
            onSave={saveGeneral}
            isSaving={updateSettings.isPending}
          />
        ) : (
          <HoursSection
            openingHours={openingHours}
            onDayClosedChange={setDayClosed}
            onAddPeriod={addPeriod}
            onRemovePeriod={removePeriod}
            onUpdatePeriod={updatePeriod}
            closures={closures}
            onAddClosure={() => setClosures((prev) => [...prev, { id: makeId(), startDate: "", endDate: "", reason: "" }])}
            onRemoveClosure={(id) => setClosures((prev) => prev.filter((c) => c.id !== id))}
            onUpdateClosure={(id, field, value) => setClosures((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))}
            onSave={saveHours}
            isSaving={updateSettings.isPending}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
