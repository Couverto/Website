// Mirrors server/src/interfaces/*.ts and server/src/utils/enums/*.ts — keep in sync manually,
// the mobile app has no shared package with the server.

export enum BookingStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum RestaurantRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export interface User {
  _id: string;
  name: string;
  forename: string;
  fullname?: string;
  email: string;
  username: string;
  role: string;
  avatar: string;
  phone: string;
  hasPassword?: boolean;
}

export interface OpeningPeriod {
  open: string;
  close: string;
}

export interface DaySchedule {
  isClosed: boolean;
  periods: OpeningPeriod[];
}

export interface RestaurantTable {
  id: string;
  label: string;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle";
  status: "available" | "reserved";
}

export interface RestaurantZone {
  id: string;
  name: string;
  tables: RestaurantTable[];
}

export interface TableClosure {
  tableId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  coverImage?: string;
  images: string[];
  menu: string[];
  capacity: number;
  openingHours: Record<string, DaySchedule>;
  cuisineType: string[];
  priceRange: string;
  rating: number;
  isClosed: boolean;
  exceptionalClosures: { startDate: string; endDate: string; reason?: string }[];
  tableClosures: TableClosure[];
  zones: RestaurantZone[];
  isOpenNow?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingCustomer {
  name: string;
  email?: string;
  phone: string;
}

export interface Booking {
  _id: string;
  user?: string | null;
  restaurant: string;
  status: BookingStatus;
  bookingDate: string;
  guests: number;
  customer: BookingCustomer;
  tableId?: string;
  zoneId?: string;
  tableLabel?: string;
  zoneName?: string;
  notes?: string;
  isDismissedByRestaurant?: boolean;
  cancellationCode?: string;
  createdAt?: string;
}

export interface RestaurantClient {
  _id: string;
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  totalBookings: number;
  totalGuests: number;
  lastVisit: string;
  firstVisit: string;
  isRegistered: boolean;
  avatar?: string;
}

export interface ReviewReply {
  text: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  restaurant: string;
  user: { _id: string; name: string; forename: string; avatar?: string };
  booking: string;
  rating: number;
  comment?: string;
  reply?: ReviewReply;
  createdAt: string;
}

export interface RestaurantStats {
  today: { bookings: number; guests: number };
  week: { bookings: number };
  month: { bookings: number };
  totalClients: number;
  dailyStats: { date: string; count: number }[];
  hourlyStats: { hour: number; count: number }[];
  statusBreakdown: Partial<Record<BookingStatus, number>>;
  guestDistribution: Record<string, number>;
  cancellationRate: number;
  averageGuests: number;
  averageLeadTime: number;
  busyDays: { day: number; count: number }[];
  activeBookings: Booking[];
  upcomingBookings: Booking[];
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface BookingsResponse extends PaginatedResponse<Booking> {
  bookings: Booking[];
}

export interface ClientsResponse extends PaginatedResponse<RestaurantClient> {
  clients: RestaurantClient[];
}

export interface RestaurantDetailsResponse {
  restaurant: Restaurant;
  userRole: RestaurantRole;
  availablePages: string[];
}

export interface DashboardStatsResponse {
  stats: RestaurantStats;
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  activeBookings: Booking[];
  dayBookings: Booking[];
}

export interface Collaborator {
  _id: string;
  name: string;
  forename: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  restaurantRole: RestaurantRole;
}

export interface Invitation {
  _id: string;
  token: string;
  restaurant: string;
  createdBy: { _id: string; name: string; forename: string };
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  features: { _id: string; name: string }[];
  active: boolean;
  isPopular: boolean;
}

export interface Payment {
  _id: string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
}

export interface SubscriptionInfo {
  plan: Plan | null;
  subscriptionStatus: "active" | "cancelled" | "expired" | "none" | "pending_payment";
  autoRenew: boolean;
  subscriptionEndDate?: string;
  referralCodeUsed: { code: string; type: string; discountPercentage: number } | null;
}

export interface ReferredRestaurant {
  _id: string;
  name: string;
  coverImage?: string;
  city: string;
  createdAt: string;
  subscriptionStatus: string;
  discountGained: number;
  discountAmountGained: number;
  cumulativeDiscount: number;
}

export interface ReferralInfo {
  referralCode: { _id: string; code: string; isActive: boolean; discountPercentage: number; createdAt: string };
  referrals: ReferredRestaurant[];
  referredBy: { name: string; coverImage?: string; city: string } | null;
  pricing: {
    planName: string;
    planPrice: number;
    discountPerReferral: number;
    totalDiscountPercentage: number;
    discountAmount: number;
    priceAfterDiscount: number;
  };
  stats: { totalReferrals: number; discountPercentage: number };
}
