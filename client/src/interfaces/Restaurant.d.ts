export interface RestaurantInterface {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  sendBookingEmail?: boolean;

  coverImage?: string;
  images: string[];
  menu: string[];
  reviews: string[];
  shortDescription?: string;
  features: string[];
  paymentMethods: string[];
  socials: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  capacity: number;
  isBankImprintEnabled?: boolean;
  bankImprintAmount?: number;
  openingHours: Record<
    string,
    {
      isClosed: boolean;
      periods: { open: string; close: string }[];
    }
  >;
  isOpenNow?: boolean;
  isClosed?: boolean;
  exceptionalClosures?: {
    startDate: string | Date;
    endDate: string | Date;
    reason?: string;
  }[];
  cuisineType: string[];
  priceRange: string;
  rating: number;
  plan?: { _id: string; name: string; price: number } | string;
  subscriptionStatus?: "active" | "cancelled" | "expired" | "none" | "pending_payment";
  collaborators: string[] | any[]; // IDs or Populated Users

  // Referral fields
  referralCode?: string;
  referredBy?: string;
  referralCodeUsed?: {
    _id: string;
    code: string;
    type: "standard" | "sponsor";
    discountPercentage: number;
  };
  referrals?: string[];
  subscriptionStartDelay?: number;

  zones: {
    id: string;
    name: string;
    tables: {
      id: string;
      label: string;
      seats: number;
      x: number;
      y: number;
      width: number;
      height: number;
      shape: "rect" | "circle";
    }[];
  }[];
  tablePlan?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantStats {
  today: { bookings: number; guests: number };
  week: { bookings: number };
  month: { bookings: number };
  totalClients: number;
  dailyStats: { date: string; count: number }[];
  hourlyStats: { hour: number; count: number }[];
  statusBreakdown: Record<string, number>;
  guestDistribution: Record<string, number>;
  cancellationRate: number;
  averageGuests: number;
  averageLeadTime: number;
  busyDays: { day: number; count: number }[];
  activeBookings?: any[]; // Enriched bookings for widgets
}
