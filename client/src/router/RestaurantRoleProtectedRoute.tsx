import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/authContext";

interface RestaurantRoleProtectedRouteProps {
  roles: string[];
  children: ReactNode;
}

export const RestaurantRoleProtectedRoute = ({ roles, children }: RestaurantRoleProtectedRouteProps) => {
  const { authUser } = useAuthContext();
  const { id } = useParams();

  const userRole = authUser?.restaurantRole || "employee";

  if (!roles.includes(userRole)) {
    return <Navigate to={`/restaurant/${id}/dashboard`} replace />;
  }

  return children;
};
