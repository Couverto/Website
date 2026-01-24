// types/express/index.d.ts
import { Request } from "express";
import { Types } from "mongoose";
import { IRestaurant } from "../interfaces/IRestaurant";

declare global {
  namespace Express {
    export interface Request {
      userId: Types.ObjectId;
      restaurant?: IRestaurant;
      restaurantRole?: string;
    }
  }
}
