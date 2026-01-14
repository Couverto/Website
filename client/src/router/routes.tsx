import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { AccountProfile } from "@/pages/Account/profile";
import { AccountLayout } from "@/pages/Account/layout";
import { AccountRestaurants } from "@/pages/Account/restaurants";
import { AccountBooking } from "@/pages/Account/booking";

import { ProtectedRoute } from "@/router/protectedRoute";
import { Landing } from "@/pages/Professional";
import { Home } from "@/pages/Home";
import { Index } from "@/pages/Admin";
import { Logs } from "@/pages/Admin/components/logs";
import { Users } from "@/pages/Admin/components/users";
import { Dashboard } from "@/pages/Admin/components/dashboard";
import { Restaurants } from "@/pages/Admin/components/restaurants";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { Config } from "@/pages/Admin/components/config";
import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";
import { Footer } from "@/components/Footer";
import { NotFound } from "@/pages/NotFound";

export const Router = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route element={<LayoutWrapper withLayout={true} />}>
        {/* Consumer Home */}
        <Route
          path="/"
          element={
            <>
              <Home />
            </>
          }
        />
        {/* Pro Landing */}
        <Route
          path="/pro"
          element={
            <>
              <Landing />
            </>
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

        {/* User Account Route */}
        {/* User Account Route */}
        <Route
          path="/account"
          element={
            <ProtectedRoute authRequired={true}>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="restaurants" element={<AccountRestaurants />} />
          <Route path="bookings" element={<AccountBooking />} />
        </Route>
      </Route>

      {/* Authenticated Application/Dashboard Routes */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute authRequired={true} role="admin">
              <Index />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Config />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
