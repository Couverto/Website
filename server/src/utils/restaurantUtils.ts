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
