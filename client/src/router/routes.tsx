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
import { Logs as AdminLogs } from "../pages/Admin/components/logs";
import { Users as AdminUsers } from "../pages/Admin/components/users";
import { AdminPlans } from "../pages/Admin/components/plans";
import { Dashboard } from "../pages/Admin/components/dashboard";
import { Restaurants } from "../pages/Admin/components/restaurants";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { Config } from "@/pages/Admin/components/config";
import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";
import { Footer } from "@/components/Footer";
import { NotFound } from "@/pages/NotFound";
import { AddRestaurantWizard } from "@/pages/Account/AddRestaurant";
import { RestaurantLayout } from "@/pages/Restaurant/layout";
import { RestaurantDashboard } from "@/pages/Restaurant/Dashboard";
import { RestaurantBookings } from "@/pages/Restaurant/Bookings";
import { RestaurantClients } from "@/pages/Restaurant/Clients";
import { RestaurantSettings } from "@/pages/Restaurant/Settings";
import { RestaurantCollaborators } from "@/pages/Restaurant/Collaborators";
import { JoinRestaurant } from "@/pages/Join";
import { PublicRestaurant } from "@/pages/PublicRestaurant";
import { PublicRestaurants } from "@/pages/PublicRestaurants";

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

        <Route
          path="/pro/create-restaurant"
          element={
            <ProtectedRoute authRequired={true}>
              <AddRestaurantWizard />
            </ProtectedRoute>
          }
        />

        {/* Public Restaurant List */}
        <Route path="/restaurants" element={<PublicRestaurants />} />

        {/* Public Restaurant Page - Moved inside LayoutWrapper for Navbar/Footer */}
        <Route path="/restaurants/infos/:id" element={<PublicRestaurant />} />
      </Route>

      {/* Authenticated Application/Dashboard Routes */}
      <Route element={<LayoutWrapper withLayout={false} />}>
        {/* Restaurant Routes */}
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute authRequired={true}>
              <RestaurantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RestaurantDashboard />} />
          <Route path="bookings" element={<RestaurantBookings />} />
          <Route path="clients" element={<RestaurantClients />} />
          <Route path="collaborators" element={<RestaurantCollaborators />} />
          <Route path="settings" element={<RestaurantSettings />} />
        </Route>
        {/* Auth Routes */}
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

        {/* Join Invitation Route */}
        <Route path="/join/:token" element={<JoinRestaurant />} />

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
          <Route path="users" element={<AdminUsers />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<Config />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
