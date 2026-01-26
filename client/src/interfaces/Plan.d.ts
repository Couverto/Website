import { Feature } from "./Feature";

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  features: Feature[];
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
