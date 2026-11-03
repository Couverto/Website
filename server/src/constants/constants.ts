/**
 * @constant Constants
 * @description Contains application-wide constants for various configurations.
 * This object includes constants such as expiration times, limits, and other fixed values.
 * @type {Object}
 * @property {number} MAX_AGE - The maximum age (in seconds) for tokens or sessions, set to 7 days.
 * @property {number} AVATAR_MAX_SIZE - The maximum size (in bytes) for an avatar file, set to 3 MB.
 * @property {RegExp} REGEX_PASSWORD - Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.
 */
export const Constants = {
  MAX_AGE: 7 * 24 * 60 * 60, // in seconds (7 days)
  AVATAR_MAX_SIZE: 3 * 1024 * 1024, // in bytes (3 MB)
  BANK_IMPRINT_CANCELLATION_HOURS: 24, // a booking secured by a bank imprint can't be cancelled online within this delay
  SUBSCRIPTION_GRACE_DAYS: 7, // days a paid restaurant stays open after its subscription period ends unpaid
  REGEX_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/,
} as const;

export type ConstantsType = typeof Constants;
