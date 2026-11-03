import { formatBookingTime, getParisWeekday } from "./dateFormatter.js";
/**
 * @function isRestaurantOpen
 * @description Helper to determine if a restaurant is currently open based on opening hours.
 */
export const isRestaurantOpen = (openingHours: any) => {
  if (!openingHours) return false;

  // Paris time regardless of the server timezone; openingHours keys are English weekday names
  const now = new Date();
  const currentDay = getParisWeekday(now);
  const currentTime = formatBookingTime(now);

  // Handle Mongoose Map or plain object
  const daySchedule = openingHours.get ? openingHours.get(currentDay) : openingHours[currentDay];

  if (!daySchedule || daySchedule.isClosed || !daySchedule.periods || daySchedule.periods.length === 0) return false;

  return !!getServicePeriod(currentTime, daySchedule.periods);
};

/**
 * @function convertOpeningHoursToObject
 * @description Helper to convert Mongoose Map to plain object for JSON serialization.
 */
export const convertOpeningHoursToObject = (openingHours: any) => {
  if (!openingHours) return {};
  if (openingHours instanceof Map || typeof openingHours.entries === "function") {
    const result: Record<string, any> = {};
    openingHours.forEach((value: any, key: string) => {
      result[key] = value;
    });
    return result;
  }
  return openingHours;
};
/**
 * @function getServicePeriod
 * @description Finds the service period (opening hours period) that a given time (HH:mm) belongs to.
 */
export const getServicePeriod = (time: string, periods: { open: string; close: string }[]) => {
  if (!periods || periods.length === 0) return null;
  return periods.find((p) => {
    if (p.close > p.open) {
      return time >= p.open && time <= p.close;
    } else {
      // Crossing midnight: e.g. 19:00 - 02:00
      // Time is either 19:00 - 23:59 OR 00:00 - 02:00
      return time >= p.open || time <= p.close;
    }
  });
};

/**
 * Amenities a restaurant can pick itself (same values as FEATURES_LIST on the client).
 * They share the `features` array with the paid features an admin grants by name, so a restaurant
 * must only ever be able to add or remove these values.
 */
export const RESTAURANT_AMENITIES = ["Terrasse", "Wifi", "Accès PMR", "Bar", "Climatisation", "Parking", "Animaux acceptés"];

/**
 * @function mergeAmenities
 * @description Replaces the amenities of a `features` array with the requested ones, keeping every other entry
 * (features granted by an admin) untouched. Unknown requested values are ignored.
 */
export const mergeAmenities = (requested: unknown, current: string[] = []): string[] => {
  const requestedAmenities = Array.isArray(requested) ? requested.filter((f) => RESTAURANT_AMENITIES.includes(f)) : [];
  const granted = current.filter((f) => !RESTAURANT_AMENITIES.includes(String(f)));
  return [...new Set([...granted, ...requestedAmenities])];
};

/**
 * Restaurant fields that only server-side flows (billing, verification, collaborator management,
 * moderation) may write. They must never be taken from a request body sent by a restaurant user.
 */
export const PROTECTED_RESTAURANT_FIELDS = [
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "tempEmail",
  "isVerified",
  "verificationToken",
  "verificationTokenExpire",
  "reviews",
  "rating",
  "features",
  "isClosed",
  "collaborators",
  "collaboratorRoles",
  "plan",
  "subscriptionStatus",
  "autoRenew",
  "subscriptionEndDate",
  "stripeCustomerId",
  "stripeSubscriptionId",
  "stripeAccountId",
  "stripeConnectEnabled",
  "referralCode",
  "referredBy",
  "referralCodeUsed",
  "referrals",
  "subscriptionStartDelay",
  "apiKey",
  "apiKeyCreatedAt",
  "paymentFailedAt",
] as const;

/**
 * @function omitProtectedRestaurantFields
 * @description Returns a copy of a request body without the protected restaurant fields.
 */
export const omitProtectedRestaurantFields = (body: Record<string, any> = {}) => {
  const safeBody = { ...body };
  PROTECTED_RESTAURANT_FIELDS.forEach((field) => delete safeBody[field]);
  return safeBody;
};

/**
 * Mongoose projection for restaurant data returned to anyone (public pages, customers' bookings):
 * hides ownership, billing, verification and API key fields.
 */
export const PUBLIC_RESTAURANT_PROJECTION =
  "-collaborators -collaboratorRoles -createdAt -updatedAt -tempEmail -verificationToken -verificationTokenExpire " +
  "-plan -subscriptionStatus -subscriptionEndDate -subscriptionStartDelay -autoRenew " +
  "-stripeCustomerId -stripeSubscriptionId -stripeAccountId -apiKey -apiKeyCreatedAt " +
  "-referralCode -referredBy -referralCodeUsed -referrals -tableClosures -paymentFailedAt";
