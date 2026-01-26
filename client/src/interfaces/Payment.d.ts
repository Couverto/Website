import { RestaurantInterface } from "./Restaurant";
import { Plan } from "./Plan";

export interface PaymentInterface {
  _id: string;
  restaurant: RestaurantInterface | string;
  plan: Plan | string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}
