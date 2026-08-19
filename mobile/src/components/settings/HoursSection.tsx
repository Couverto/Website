import React from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SaveButton } from "./fields";
import { DaySchedule, OpeningPeriod } from "../../types";

export interface ClosureDraft {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

const DAY_ORDER: { key: string; label: string }[] = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

function DayRow({
  label,
  schedule,
  onToggleClosed,
  onAddPeriod,
  onRemovePeriod,
  onUpdatePeriod,
}: Readonly<{
  label: string;
  schedule: DaySchedule;
  onToggleClosed: (isClosed: boolean) => void;
  onAddPeriod: () => void;
  onRemovePeriod: (index: number) => void;
  onUpdatePeriod: (index: number, field: keyof OpeningPeriod, value: string) => void;
}>) {
  return (
    <View className="bg-white rounded-2xl border border-border p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-sm text-gray-900">{label}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted font-medium">{schedule.isClosed ? "Fermé" : "Ouvert"}</Text>
          <Switch value={!schedule.isClosed} onValueChange={(open) => onToggleClosed(!open)} trackColor={{ true: "#2ecc9a", false: "#e5e7eb" }} />
        </View>
      </View>

      {!schedule.isClosed ? (
        <View className="gap-2">
          {schedule.periods.map((period, index) => (
            <View key={`${period.open}-${period.close}-${index}`} className="flex-row items-center gap-2">
              <TextInput
                value={period.open}
                onChangeText={(v) => onUpdatePeriod(index, "open", v)}
                placeholder="12:00"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-center"
              />
              <Text className="text-muted">→</Text>
              <TextInput
                value={period.close}
                onChangeText={(v) => onUpdatePeriod(index, "close", v)}
                placeholder="14:00"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-center"
              />
              <Pressable onPress={() => onRemovePeriod(index)} hitSlop={8} className="p-1">
                <Feather name="trash-2" size={16} color="#d32f2f" />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={onAddPeriod} className="flex-row items-center gap-1.5 self-start mt-1">
            <Feather name="plus" size={14} color="#173B15" />
            <Text className="text-primary text-xs font-bold">Ajouter un créneau</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ClosureRow({
  closure,
  onChange,
  onRemove,
}: Readonly<{
  closure: ClosureDraft;
  onChange: (field: keyof ClosureDraft, value: string) => void;
  onRemove: () => void;
}>) {
  return (
    <View className="bg-white rounded-2xl border border-border p-4 mb-3">
      <View className="flex-row items-center gap-2 mb-2">
        <TextInput
          value={closure.startDate}
          onChangeText={(v) => onChange("startDate", v)}
          placeholder="AAAA-MM-JJ"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-center"
        />
        <Text className="text-muted">→</Text>
        <TextInput
          value={closure.endDate}
          onChangeText={(v) => onChange("endDate", v)}
          placeholder="AAAA-MM-JJ"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-center"
        />
        <Pressable onPress={onRemove} hitSlop={8} className="p-1">
          <Feather name="trash-2" size={16} color="#d32f2f" />
        </Pressable>
      </View>
      <TextInput
        value={closure.reason ?? ""}
        onChangeText={(v) => onChange("reason", v)}
        placeholder="Motif (optionnel)"
        className="border border-border rounded-lg px-3 py-2 text-sm"
      />
    </View>
  );
}

interface HoursSectionProps {
  openingHours: Record<string, DaySchedule>;
  onDayClosedChange: (day: string, isClosed: boolean) => void;
  onAddPeriod: (day: string) => void;
  onRemovePeriod: (day: string, index: number) => void;
  onUpdatePeriod: (day: string, index: number, field: keyof OpeningPeriod, value: string) => void;
  closures: ClosureDraft[];
  onAddClosure: () => void;
  onRemoveClosure: (id: string) => void;
  onUpdateClosure: (id: string, field: keyof ClosureDraft, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function HoursSection({
  openingHours,
  onDayClosedChange,
  onAddPeriod,
  onRemovePeriod,
  onUpdatePeriod,
  closures,
  onAddClosure,
  onRemoveClosure,
  onUpdateClosure,
  onSave,
  isSaving,
}: Readonly<HoursSectionProps>) {
  return (
    <View>
      {DAY_ORDER.map(({ key, label }) => (
        <DayRow
          key={key}
          label={label}
          schedule={openingHours[key] ?? { isClosed: true, periods: [] }}
          onToggleClosed={(isClosed) => onDayClosedChange(key, isClosed)}
          onAddPeriod={() => onAddPeriod(key)}
          onRemovePeriod={(index) => onRemovePeriod(key, index)}
          onUpdatePeriod={(index, field, value) => onUpdatePeriod(key, index, field, value)}
        />
      ))}

      <Text className="text-xs font-black uppercase tracking-widest text-muted mt-4 mb-2">Fermetures exceptionnelles</Text>
      {closures.map((closure) => (
        <ClosureRow
          key={closure.id}
          closure={closure}
          onChange={(field, value) => onUpdateClosure(closure.id, field, value)}
          onRemove={() => onRemoveClosure(closure.id)}
        />
      ))}
      <Pressable onPress={onAddClosure} className="flex-row items-center gap-1.5 self-start mb-4">
        <Feather name="plus" size={14} color="#173B15" />
        <Text className="text-primary text-xs font-bold">Ajouter une fermeture</Text>
      </Pressable>

      <SaveButton onPress={onSave} isSaving={isSaving} />
    </View>
  );
}
