/**
 * @function isRestaurantOpen
 * @description Helper to determine if a restaurant is currently open based on opening hours.
 */
export const isRestaurantOpen = (openingHours: any) => {
  if (!openingHours) return false;

  // Use Intl.DateTimeFormat to get French local time regardless of server timezone
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  const currentDay = partMap.weekday.toLowerCase();
  const currentTime = `${partMap.hour}:${partMap.minute}`;

  // Handle Mongoose Map or plain object
  const daySchedule = openingHours.get ? openingHours.get(currentDay) : openingHours[currentDay];

  if (!daySchedule || daySchedule.isClosed || !daySchedule.periods || daySchedule.periods.length === 0) return false;

  return daySchedule.periods.some((period: { open: string; close: string }) => {
    return currentTime >= period.open && currentTime <= period.close;
  });
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
