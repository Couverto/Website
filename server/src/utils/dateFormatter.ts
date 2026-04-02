/**
 * Utility functions for date formatting in the French timezone (Europe/Paris).
 * This ensures consistency across the application regardless of the server's local timezone.
 */

const TIMEZONE = "Europe/Paris";
const LOCALE = "fr-FR";

/**
 * Formats a date into a long French string (e.g., "jeudi 2 avril 2026").
 */
export const formatBookingDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });
};

/**
 * Formats a date into a short French time string (e.g., "20:00").
 */
export const formatBookingTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
};

/**
 * Formats a date into a standard French date string (e.g., "02/04/2026").
 */
export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
  });
};
