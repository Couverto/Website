// Mirrors server/src/utils/dateFormatter.ts so dates/times shown on mobile match
// what's in the confirmation emails and the web dashboard.
const TIMEZONE = "Europe/Paris";
const LOCALE = "fr-FR";

export const formatBookingDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: TIMEZONE });
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", timeZone: TIMEZONE });
};

export const formatBookingTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE });
};

export const formatDayLabel = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, { day: "2-digit", month: "short", timeZone: TIMEZONE }).replace(".", "");
};
