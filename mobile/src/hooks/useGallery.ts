import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { uploadRestaurantImage } from "../api/uploads";
import { updateRestaurantSettings } from "../api/restaurants";
import { Restaurant } from "../types";
import { getApiErrorMessage } from "../api/client";

const GALLERY_LIMIT = 8;
const MENU_LIMIT = 8;

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission requise", "Autorisez l'accès à vos photos pour ajouter une image.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

/**
 * Orchestrates pick -> upload -> save-to-restaurant for the cover image, gallery, and menu
 * fields, mirroring client/src/pages/Restaurant/Gallery's auto-save-on-change behaviour.
 */
export function useGallery(restaurantId: string | null, restaurant: Restaurant | undefined) {
  const queryClient = useQueryClient();
  const [busyField, setBusyField] = useState<"cover" | "gallery" | "menu" | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["restaurant-details", restaurantId] });

  const runUpload = async (
    field: "cover" | "gallery" | "menu",
    action: (url: string) => Promise<void>,
  ) => {
    if (!restaurantId) return;
    const asset = await pickImage();
    if (!asset) return;
    setBusyField(field);
    try {
      const url = await uploadRestaurantImage(field, { uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType });
      await action(url);
      invalidate();
    } catch (err) {
      Alert.alert("Erreur", getApiErrorMessage(err, "L'upload a échoué."));
    } finally {
      setBusyField(null);
    }
  };

  const setCover = () =>
    runUpload("cover", async (url) => {
      await updateRestaurantSettings(restaurantId as string, { coverImage: url });
    });

  const addGalleryImage = () =>
    runUpload("gallery", async (url) => {
      const current = restaurant?.images ?? [];
      if (current.length >= GALLERY_LIMIT) {
        Alert.alert("Limite atteinte", `La galerie ne peut contenir que ${GALLERY_LIMIT} images maximum.`);
        return;
      }
      await updateRestaurantSettings(restaurantId as string, { images: [...current, url] });
    });

  const addMenuImage = () =>
    runUpload("menu", async (url) => {
      const current = restaurant?.menu ?? [];
      if (current.length >= MENU_LIMIT) {
        Alert.alert("Limite atteinte", `Le menu ne peut contenir que ${MENU_LIMIT} pages maximum.`);
        return;
      }
      await updateRestaurantSettings(restaurantId as string, { menu: [...current, url] });
    });

  const removeGalleryImage = async (url: string) => {
    if (!restaurantId) return;
    setBusyField("gallery");
    try {
      await updateRestaurantSettings(restaurantId, { images: (restaurant?.images ?? []).filter((i) => i !== url) });
      invalidate();
    } catch (err) {
      Alert.alert("Erreur", getApiErrorMessage(err));
    } finally {
      setBusyField(null);
    }
  };

  const removeMenuImage = async (url: string) => {
    if (!restaurantId) return;
    setBusyField("menu");
    try {
      await updateRestaurantSettings(restaurantId, { menu: (restaurant?.menu ?? []).filter((i) => i !== url) });
      invalidate();
    } catch (err) {
      Alert.alert("Erreur", getApiErrorMessage(err));
    } finally {
      setBusyField(null);
    }
  };

  return { busyField, setCover, addGalleryImage, addMenuImage, removeGalleryImage, removeMenuImage };
}
