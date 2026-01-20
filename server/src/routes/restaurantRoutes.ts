import express from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurants,
  updateRestaurant,
  getPublicRestaurants,
  getMyRestaurants,
  getRestaurantById,
  getRestaurantStats,
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateRestaurantSettings,
  getPublicRestaurantById,
  toggleRestaurantClosed,
} from "../controllers/restaurantController.js";
import {
  createInvitation,
  getInvitations,
  deleteInvitation,
  getInvitationInfo,
  acceptInvitation,
} from "../controllers/invitationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyCollaborator } from "../middlewares/verifyCollaborator.js";
import { userRoles } from "../utils/enums/userRoles.js";

export const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get("/public", getPublicRestaurants);
restaurantRouter.get("/public/:id", getPublicRestaurantById);

// User routes (authenticated)
restaurantRouter.get("/my", verifyToken(), getMyRestaurants);

// Admin routes
restaurantRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getRestaurants);
restaurantRouter.post("/", verifyToken(), createRestaurant);
restaurantRouter.put("/:id", verifyToken({ role: userRoles.ADMIN }), updateRestaurant);
restaurantRouter.delete("/:id", verifyToken(), verifyCollaborator(), deleteRestaurant);

// Collaborator routes (requires being a collaborator of the restaurant)
restaurantRouter.get("/:id/details", verifyToken(), verifyCollaborator(), getRestaurantById);
restaurantRouter.get("/:id/stats", verifyToken(), verifyCollaborator(), getRestaurantStats);
restaurantRouter.put("/:id/settings", verifyToken(), verifyCollaborator(), updateRestaurantSettings);
restaurantRouter.patch("/:id/toggle-closed", verifyToken(), verifyCollaborator(), toggleRestaurantClosed);

// Collaborator management
restaurantRouter.get("/:id/collaborators", verifyToken(), verifyCollaborator(), getCollaborators);
restaurantRouter.post("/:id/collaborators", verifyToken(), verifyCollaborator(), addCollaborator);
restaurantRouter.delete("/:id/collaborators/:collaboratorId", verifyToken(), verifyCollaborator(), removeCollaborator);

// Invitation routes
restaurantRouter.post("/:id/invitations", verifyToken(), verifyCollaborator(), createInvitation);
restaurantRouter.get("/:id/invitations", verifyToken(), verifyCollaborator(), getInvitations);
restaurantRouter.delete("/:id/invitations/:invitationId", verifyToken(), verifyCollaborator(), deleteInvitation);

// Public invitation routes
restaurantRouter.get("/invitations/:token", getInvitationInfo);
restaurantRouter.post("/invitations/:token/accept", verifyToken(), acceptInvitation);
