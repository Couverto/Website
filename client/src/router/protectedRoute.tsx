import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/authContext";

export const ProtectedRoute = ({ authRequired, role, children }: { authRequired: boolean; role?: String; children: ReactNode }) => {
  const { authUser } = useAuthContext();

  if (authUser && role && authUser.role !== role) {
    return <Navigate to="/app" />;
  }

  if (authRequired && !authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!authRequired && authUser) {
    return <Navigate to="/app" replace />;
  }

  return children;
};
