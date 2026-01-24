import { ReactNode } from "react";
import { Navigate, useParams, useOutletContext } from "react-router-dom";

interface RestaurantContext {
  restaurant: any;
  userRole: string;
}

interface RestaurantRoleProtectedRouteProps {
  roles: string[];
  children: ReactNode;
}

export const RestaurantRoleProtectedRoute = ({ roles, children }: RestaurantRoleProtectedRouteProps) => {
  const { id } = useParams();
  const context = useOutletContext<RestaurantContext>();

  const userRole = context?.userRole || "employee";

  if (!roles.includes(userRole)) {
    return <Navigate to={`/restaurant/${id}/dashboard`} replace />;
  }

  return children;
};
