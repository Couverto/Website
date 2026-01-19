import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/authContext";

export const ProtectedRoute = ({ authRequired, role, children }: { authRequired: boolean; role?: String; children: ReactNode }) => {
  const { authUser } = useAuthContext();

  const location = useLocation();

  if (authUser && role && authUser.role !== role) {
    return <Navigate to={authUser.role === "admin" ? "/admin/dashboard" : "/"} />;
  }

  if (authRequired && !authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!authRequired && authUser) {
    const params = new URLSearchParams(location.search);
    const redirect = location.state?.redirect || params.get("redirect") || "/";
    return <Navigate to={redirect} replace />;
  }

  return children;
};
