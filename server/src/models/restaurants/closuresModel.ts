import { Schema } from "mongoose";
import { IExceptionalClosure, IExceptionalOpening } from "../../interfaces/IRestaurant.js";

/** A date range where the restaurant is exceptionally closed (e.g. holidays). */
export const ExceptionalClosureSchema = new Schema<IExceptionalClosure>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: "Fermeture exceptionnelle" },
  },
  { _id: false },
);

/** A date range where the restaurant is exceptionally open, with custom hours. */
export const ExceptionalOpeningSchema = new Schema<IExceptionalOpening>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: "Ouverture exceptionnelle" },
    periods: {
      type: [{ open: { type: String, required: true }, close: { type: String, required: true } }],
      default: [],
    },
  },
  { _id: false },
);
