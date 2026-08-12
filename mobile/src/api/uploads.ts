import { apiClient } from "./client";

export type RestaurantImageKind = "cover" | "gallery" | "menu";

const UPLOAD_PATHS: Record<RestaurantImageKind, string> = {
  cover: "/uploads/restaurants/cover",
  gallery: "/uploads/restaurants/gallery",
  menu: "/uploads/restaurants/menu",
};

export interface PickedAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export const uploadRestaurantImage = async (kind: RestaurantImageKind, asset: PickedAsset): Promise<string> => {
  const formData = new FormData();
  // React Native's FormData accepts { uri, name, type } file descriptors — not a DOM Blob.
  formData.append("image", {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    type: asset.mimeType ?? "image/jpeg",
  } as unknown as Blob);

  const { data } = await apiClient.post<{ url: string }>(UPLOAD_PATHS[kind], formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};
