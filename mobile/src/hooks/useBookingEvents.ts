import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../contexts/SocketContext";

/**
 * Invalidates booking/dashboard/client queries whenever the server emits
 * "newBooking" or "updateBooking" for the joined restaurant room, so every
 * screen showing booking data stays live without manual polling.
 */
export function useBookingEvents(restaurantId: string | null) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["clients", restaurantId] });
    };

    socket.on("newBooking", invalidate);
    socket.on("updateBooking", invalidate);

    return () => {
      socket.off("newBooking", invalidate);
      socket.off("updateBooking", invalidate);
    };
  }, [socket, restaurantId, queryClient]);
}
