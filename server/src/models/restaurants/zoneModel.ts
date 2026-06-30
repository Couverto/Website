import { Schema } from "mongoose";
import { IZone } from "../../interfaces/IRestaurant.js";
import { TableSchema } from "./table.schema.js";

/** A zone groups several tables together (e.g. "Terrace", "Main room"). */
export const ZoneSchema = new Schema<IZone>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    tables: { type: [TableSchema], default: [] },
  },
  { _id: false },
);
