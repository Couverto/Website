import { apiClient } from "./client";
import { User } from "../types";

export interface LoginResponse {
  user: User;
  accessToken: string;
  message: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return data;
};

export const getConnectedUser = async (): Promise<User> => {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
};
