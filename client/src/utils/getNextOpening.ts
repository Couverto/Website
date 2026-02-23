/**
 * Compute "Ouvre dans ..." text based on openingHours.
 * Only shows "Ouvre dans ..." for same-day openings.
 * Returns "Fermé aujourd'hui" if the next opening is tomorrow or later.
 * Returns null if no next opening can be determined.
 */
export const getNextOpeningText = (
  openingHours?: Record<string, { isClosed: boolean; periods: { open: string; close: string }[] }>,
): string | null => {
  if (!openingHours) return null;

  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check today first for a future opening period
  const todayName = dayNames[currentDayIndex];
  const todaySchedule = openingHours[todayName];

  if (todaySchedule && !todaySchedule.isClosed && todaySchedule.periods?.length > 0) {
    for (const period of todaySchedule.periods) {
      const [openH, openM] = period.open.split(":").map(Number);
      const openMinutes = openH * 60 + openM;

      if (openMinutes > currentMinutes) {
        const diff = openMinutes - currentMinutes;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (mins > 0) parts.push(`${mins}min`);

        return `Ouvre dans ${parts.join(" ")}`;
      }
    }
  }

  // Next opening is not today
  return "Fermé aujourd'hui";
};
