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
  getRestaurantSlots,
  updateCollaboratorRole,
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
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";

export const restaurantRouter = express.Router();

// Public routes
restaurantRouter.get("/public", getPublicRestaurants);
restaurantRouter.get("/public/:id", getPublicRestaurantById);
restaurantRouter.get("/public/:id/slots", getRestaurantSlots);

// User routes (authenticated)
restaurantRouter.get("/my", verifyToken(), getMyRestaurants);

// Admin routes
restaurantRouter.get("/", verifyToken({ role: userRoles.ADMIN }), getRestaurants);
restaurantRouter.post("/", verifyToken(), createRestaurant);
restaurantRouter.put("/:id", verifyToken({ role: userRoles.ADMIN }), updateRestaurant);
restaurantRouter.delete("/:id", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), deleteRestaurant);

// Collaborator routes (requires being a collaborator of the restaurant)
restaurantRouter.get(
  "/:id/details",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER, restaurantRoles.EMPLOYEE]),
  getRestaurantById,
);
restaurantRouter.get("/:id/stats", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), getRestaurantStats);
restaurantRouter.put("/:id/settings", verifyToken(), verifyCollaborator([restaurantRoles.ADMIN]), updateRestaurantSettings);
restaurantRouter.patch(
  "/:id/toggle-closed",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  toggleRestaurantClosed,
);

// Collaborator management
restaurantRouter.get(
  "/:id/collaborators",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  getCollaborators,
);
restaurantRouter.post(
  "/:id/collaborators",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  addCollaborator,
);
restaurantRouter.patch(
  "/:id/collaborators/:collaboratorId/role",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN]),
  updateCollaboratorRole,
);
restaurantRouter.delete(
  "/:id/collaborators/:collaboratorId",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  removeCollaborator,
);

// Invitation routes
restaurantRouter.post(
  "/:id/invitations",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  createInvitation,
);
restaurantRouter.get(
  "/:id/invitations",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  getInvitations,
);
restaurantRouter.delete(
  "/:id/invitations/:invitationId",
  verifyToken(),
  verifyCollaborator([restaurantRoles.ADMIN, restaurantRoles.MANAGER]),
  deleteInvitation,
);

// Public invitation routes
restaurantRouter.get("/invitations/:token", getInvitationInfo);
restaurantRouter.post("/invitations/:token/accept", verifyToken(), acceptInvitation);
