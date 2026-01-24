export interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
