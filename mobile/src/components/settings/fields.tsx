import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

export function FieldLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5">{children}</Text>;
}

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "url";
}

export function TextField({ label, value, onChangeText, multiline, keyboardType }: Readonly<TextFieldProps>) {
  return (
    <View className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        className={`border border-border rounded-xl px-4 py-3 text-base text-gray-900 bg-white ${multiline ? "min-h-[90px]" : ""}`}
      />
    </View>
  );
}

export function SaveButton({ onPress, isSaving }: Readonly<{ onPress: () => void; isSaving: boolean }>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isSaving}
      className="bg-accent rounded-xl py-3.5 items-center mt-2"
      style={{ opacity: isSaving ? 0.7 : 1 }}
    >
      {isSaving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Enregistrer</Text>}
    </Pressable>
  );
}
