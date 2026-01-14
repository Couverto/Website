import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurants,
  updateRestaurant,
  getPublicRestaurants,
} from "../controllers/restaurantController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const restaurantRouter = express.Router();

restaurantRouter.get("/public", getPublicRestaurants);

restaurantRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getRestaurants);
restaurantRouter.post("/", verifyToken({ role: userRoles.ADMIN }), createRestaurant);
restaurantRouter.put("/:id", verifyToken({ role: userRoles.ADMIN }), updateRestaurant);
restaurantRouter.delete("/:id", verifyToken({ role: userRoles.ADMIN }), deleteRestaurant);
