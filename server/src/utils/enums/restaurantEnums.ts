/** Price range displayed to customers, from cheapest ($) to most expensive ($$$$$). */
export enum priceRanges {
  CHEAP = "$",
  AFFORDABLE = "$$",
  MODERATE = "$$$",
  EXPENSIVE = "$$$$",
  LUXURY = "$$$$$",
}

/** Status of a restaurant's subscription to the platform. */
export enum subscriptionStatuses {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  NONE = "none",
  PENDING_PAYMENT = "pending_payment",
}

/** Visual shape of a table on the floor plan editor. */
export enum tableShapes {
  RECT = "rect",
  CIRCLE = "circle",
}

/** Current booking status of a table. */
export enum tableStatuses {
  AVAILABLE = "available",
  RESERVED = "reserved",
}

/**
 * Role of a collaborator *within a specific restaurant* (not to be confused
 * with the platform-wide userRoles enum). A user can be OWNER of one
 * restaurant and STAFF of another.
 */
export enum collaboratorRoles {
  OWNER = "owner",
  STAFF = "staff",
}

/** Amenities/features a restaurant can highlight (e.g. on its public page). */
export enum restaurantFeatures {
  TERRACE = "terrace",
  WIFI = "wifi",
  WHEELCHAIR_ACCESSIBLE = "wheelchair_accessible",
  PARKING = "parking",
  PET_FRIENDLY = "pet_friendly",
  AIR_CONDITIONING = "air_conditioning",
  PRIVATE_ROOM = "private_room",
  OUTDOOR_SEATING = "outdoor_seating",
  KID_FRIENDLY = "kid_friendly",
  LIVE_MUSIC = "live_music",
}

/** Payment methods accepted by a restaurant. */
export enum paymentMethods {
  CARD = "card",
  CASH = "cash",
  CHECK = "check",
  MEAL_VOUCHER = "meal_voucher", // tickets restaurant
  CONTACTLESS = "contactless",
  ONLINE_PAYMENT = "online_payment",
}

/** Type(s) of cuisine served by a restaurant. */
export enum cuisineTypes {
  FRENCH = "french",
  ITALIAN = "italian",
  JAPANESE = "japanese",
  CHINESE = "chinese",
  INDIAN = "indian",
  MEXICAN = "mexican",
  AMERICAN = "american",
  MEDITERRANEAN = "mediterranean",
  THAI = "thai",
  LEBANESE = "lebanese",
  VEGAN = "vegan",
  SEAFOOD = "seafood",
  PIZZA = "pizza",
  BURGER = "burger",
  BAKERY = "bakery",
  FUSION = "fusion",
  OTHER = "other",
}

/** Social media platforms a restaurant can link to from its public page. */
export enum socialPlatforms {
  FACEBOOK = "facebook",
  INSTAGRAM = "instagram",
  TIKTOK = "tiktok",
}
