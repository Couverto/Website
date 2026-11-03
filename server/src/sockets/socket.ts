import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { corsOptions } from "../configuration/corsOptions.js";
import { User } from "../models/userModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { userRoles } from "../utils/enums/userRoles.js";

let io: SocketIOServer | undefined;

const userSocketMap: Record<string, string> = {};

// Room receiving admin-only events (e.g. "newLog")
export const ADMIN_ROOM = "admins";

/**
 * Initializes the Socket.IO server.
 * Every connection must present a valid access token (`auth.token`); the user ID is taken from it,
 * never from the client.
 * @param httpServer - The HTTP server to attach Socket.IO to.
 */
export function initSockets(httpServer: http.Server): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: corsOptions,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string") return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string) as JwtPayload & { id: string };
      const user = await User.findById(decoded.id).select("_id role");
      if (!user) return next(new Error("Unauthorized"));

      socket.data.userId = user._id.toString();
      socket.data.isAdmin = user.role === userRoles.ADMIN;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId: string = socket.data.userId;

    userSocketMap[userId] = socket.id;
    io?.emit("getOnlineUsers", Object.keys(userSocketMap)); // Broadcast updated online users

    if (socket.data.isAdmin) {
      socket.join(ADMIN_ROOM);
    }

    // Booking events of a restaurant are only sent to its collaborators (and global admins)
    socket.on("joinRestaurant", async (restaurantId: string) => {
      try {
        if (typeof restaurantId !== "string" || !mongoose.Types.ObjectId.isValid(restaurantId)) return;

        if (!socket.data.isAdmin) {
          const isCollaborator = await Restaurant.exists({ _id: restaurantId, collaborators: userId });
          if (!isCollaborator) return;
        }

        socket.join(`restaurant_${restaurantId}`);
      } catch (err) {
        console.error("joinRestaurant failed", err);
      }
    });

    socket.on("disconnect", () => {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
      io?.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
