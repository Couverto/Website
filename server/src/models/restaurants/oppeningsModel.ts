import { Schema } from "mongoose";
import { IOpeningPeriod, IDayOpeningHours } from "../../interfaces/IRestaurant.js";

/** A single open/close time range within a day (e.g. lunch service, dinner service). */
const OpeningPeriodSchema = new Schema<IOpeningPeriod>(
  {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false },
);

/**
 * Opening hours for a single day of the week.
 * Used as the value type of the openingHours Map on Restaurant.
 * Explicitly defined as a Schema (not an inline object) so Mongoose
 * actually validates the nested structure and TS typing stays consistent.
 */
export const DayOpeningHoursSchema = new Schema<IDayOpeningHours>(
  {
    isClosed: { type: Boolean, default: false },
    periods: { type: [OpeningPeriodSchema], default: [] },
  },
  { _id: false },
);
