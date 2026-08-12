import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useRestaurant } from "./RestaurantContext";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export const useSocket = (): Socket | null => useContext(SocketContext).socket;

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeRestaurantId } = useRestaurant();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Connect once we know who the user is.
  useEffect(() => {
    if (!user?._id || !API_URL) return;

    const newSocket = io(API_URL, { query: { userId: user._id } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  // Join the restaurant's room so the server routes booking events to us,
  // mirroring client/src/pages/Restaurant/layout.tsx's socket.emit("joinRestaurant", id).
  useEffect(() => {
    if (!socket || !activeRestaurantId) return;
    socket.emit("joinRestaurant", activeRestaurantId);
  }, [socket, activeRestaurantId]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
