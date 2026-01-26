/**
 * @function isRestaurantOpen
 * @description Helper to determine if a restaurant is currently open based on opening hours.
 */
export const isRestaurantOpen = (openingHours: any) => {
  if (!openingHours) return false;

  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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
