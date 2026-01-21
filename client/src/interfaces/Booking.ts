import { RestaurantInterface } from "./Restaurant";

export type BookingStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "CANCELLED";

export interface BookingCustomer {
  name: string;
  email?: string;
  phone: string;
}

export interface BookingInterface {
  _id: string;
  restaurant: Pick<RestaurantInterface, "_id" | "name" | "slug" | "coverImage" | "city" | "adress" | "phone" | "website" | "openingHours">;
  status: BookingStatus;
  bookingDate: string;
  guests: number;
  customer: BookingCustomer;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  bookings: BookingInterface[];
  count: number;
  page: number;
  size: number;
  totalPages: number;
}
