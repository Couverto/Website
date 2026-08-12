import { apiClient } from "./client";
import { Plan } from "../types";

export const getPublicPlans = async (): Promise<Plan[]> => {
  const { data } = await apiClient.get<{ plans: Plan[] }>("/plans/public");
  return data.plans;
};
