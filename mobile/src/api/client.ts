import axios from "axios";
import { tokenStorage } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL && __DEV__) {
  console.warn("EXPO_PUBLIC_API_URL is not set — copy .env.example to .env and point it at your API server.");
}

export const apiClient = axios.create({
  baseURL: `${API_URL ?? ""}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extracts a user-facing message from an API error, mirroring the client's error shape ({ error: string }). */
export function getApiErrorMessage(error: unknown, fallback = "Une erreur est survenue"): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? fallback;
  }
  return fallback;
}
