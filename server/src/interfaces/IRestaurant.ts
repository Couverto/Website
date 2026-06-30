import { Document, Types } from "mongoose";
import {
  priceRanges,
  subscriptionStatuses,
  tableShapes,
  tableStatuses,
  collaboratorRoles,
  restaurantFeatures,
  paymentMethods,
  cuisineTypes,
  socialPlatforms,
} from "../utils/enums/restaurantEnums.js";

/* ------------------------------------------------------------------ */
/* Sub-document interfaces                                            */
/* ------------------------------------------------------------------ */

/** A single table on the floor plan editor. */
export interface ITable {
  id: string;
  label: string;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: tableShapes;
  status: tableStatuses;
}

/** A zone grouping several tables together (e.g. "Terrace", "Main room"). */
export interface IZone {
  id: string;
  name: string;
  tables: ITable[];
}

/** A single open/close time range within a day (e.g. lunch service). */
export interface IOpeningPeriod {
  open: string; // e.g. "12:00"
  close: string; // e.g. "14:30"
}

/** Opening hours configuration for a single day of the week. */
export interface IDayOpeningHours {
  isClosed: boolean;
  periods: IOpeningPeriod[];
}

/** A date range where the restaurant is exceptionally closed (e.g. holidays). */
export interface IExceptionalClosure {
  startDate: Date;
  endDate: Date;
  reason: string;
}

/** A date range where the restaurant is exceptionally open, with custom hours. */
export interface IExceptionalOpening {
  startDate: Date;
  endDate: Date;
  reason: string;
  periods: IOpeningPeriod[];
}

/** A specific table blocked for a date range (e.g. reserved by phone, broken). */
export interface ITableClosure {
  tableId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

/** Social media links displayed on the restaurant's public page. */
export interface ISocials {
  facebook: string;
  instagram: string;
  tiktok: string;
}

/** Subscription/billing-related fields, embedded as a sub-document. */
export interface IRestaurantSubscription {
  plan: Types.ObjectId | null;
  status: subscriptionStatuses;
  autoRenew: boolean;
  endDate: Date | null;
  startDelay: number; // days of delay before subscription starts

  /** Excluded from query results by default (select: false). */
  stripeCustomerId?: string | null;
  /** Excluded from query results by default (select: false). */
  stripeSubscriptionId?: string | null;
  /** Excluded from query results by default (select: false). */
  stripeAccountId?: string | null;

  stripeConnectEnabled: boolean;
}

/** Referral-program-related fields, embedded as a sub-document. */
export interface IRestaurantReferral {
  code: Types.ObjectId | null;
  referredBy: Types.ObjectId | null;
  codeUsed: Types.ObjectId | null;
  referrals: Types.ObjectId[];
}

/* ------------------------------------------------------------------ */
/* Main Restaurant document interface                                 */
/* ------------------------------------------------------------------ */

/**
 * Represents a Restaurant document in the database.
 * Extends Mongoose's Document to provide typing for both schema fields
 * and Mongoose-specific properties (e.g. _id, timestamps).
 */
export interface IRestaurant extends Document {
  // --- Identity ---
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string; // One-liner shown in listings

  // --- Contact & location ---
  address: string;
  city: string;
  phone: string;
  email: string;
  /** Pending email awaiting verification, see verificationToken. */
  tempEmail?: string;
  website?: string;

  // --- Email verification ---
  isVerified: boolean;
  /** Excluded from query results by default (select: false). */
  verificationToken?: string;
  /** Excluded from query results by default (select: false). */
  verificationTokenExpire?: Date;

  // --- Notifications ---
  sendBookingEmail: boolean;

  // --- Media & presentation ---
  coverImage: string;
  images: string[];
  menu: string[];
  features: restaurantFeatures[];
  paymentMethods: paymentMethods[];
  cuisineType: cuisineTypes[];
  socials: Map<socialPlatforms, string>;
  priceRange: priceRanges;
  rating: number;

  // --- Booking / payment policy ---
  capacity: number;
  isBankImprintEnabled: boolean;
  bankImprintAmount: number;

  // --- Open/closed state ---
  isClosed: boolean;
  openingHours: Map<string, IDayOpeningHours>; // keyed by day, e.g. "monday"
  exceptionalClosures: IExceptionalClosure[];
  exceptionalOpenings: IExceptionalOpening[];
  tableClosures: ITableClosure[];

  // --- Floor plan ---
  zones: IZone[];
  /**
   * Legacy/flat floor plan, kept for restaurants not yet migrated to zones.
   * @deprecated Consider removing once all restaurants use `zones`.
   */
  tablePlan: ITable[];

  // --- Team ---
  collaborators: Types.ObjectId[]; // refs User
  collaboratorRoles: Map<string, collaboratorRoles>; // keyed by collaborator's User _id (as string)

  // --- Subscription & referral ---
  subscription: IRestaurantSubscription;
  referral: IRestaurantReferral;

  // --- External API access ---
  /** Hashed API key. Excluded from query results by default (select: false). */
  apiKey?: string | null;
  apiKeyCreatedAt: Date | null;

  // --- Timestamps (managed by Mongoose { timestamps: true }) ---
  createdAt: Date;
  updatedAt: Date;
}
