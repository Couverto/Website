import { Schema } from "mongoose";
import { ITable } from "../../interfaces/IRestaurant.js";
import { tableShapes, tableStatuses } from "../../utils/enums/restaurantEnums.js";

/**
 * Reusable sub-schema representing a single table on the floor plan.
 * Used both inside a Zone (zones.tables) and in the legacy flat tablePlan.
 * Defining it once avoids duplicating validation logic in two places.
 */
export const TableSchema = new Schema<ITable>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    seats: { type: Number, required: true, min: 1 },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    shape: { type: String, enum: Object.values(tableShapes), default: tableShapes.RECT },
    status: { type: String, enum: Object.values(tableStatuses), default: tableStatuses.AVAILABLE },
  },
  { _id: false }, // pure sub-document, no need for its own ObjectId
);
