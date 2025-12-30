import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { Account } from "@/pages/Account";
import { ProtectedRoute } from "@/router/protectedRoute";
import { Landing } from "@/pages/Landing";
import { Index } from "@/pages/Admin";
import { Logs } from "@/pages/Admin/components/logs";
import { Users } from "@/pages/Admin/components/users";
import { Dashboard } from "@/pages/Admin/components/dashboard";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { Config } from "@/pages/Admin/components/config";
import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";

export const Router = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        <Route
          path="/"
          element={
            <ProtectedRoute authRequired={false}>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute authRequired={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute authRequired={false}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register/google"
          element={
            <ProtectedRoute authRequired={false}>
              <RegisterGoogleForm />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Authenticated Admin/Dashboard Routes */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        <Route
          path="/admin"
          element={
            <ProtectedRoute authRequired={true}>
              <Index />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Config />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
