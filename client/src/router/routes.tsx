import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { AccountProfile } from "@/pages/Account/profile";
import { AccountLayout } from "@/pages/Account/layout";
import { AccountRestaurants } from "@/pages/Account/restaurants";
import { AccountBooking } from "@/pages/Account/booking";
import { AccountPreferences } from "@/pages/Account/preferences";

import { ProtectedRoute } from "@/router/protectedRoute";
import { Landing } from "@/pages/Professional";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Index } from "@/pages/Admin";
import { Logs as AdminLogs } from "../pages/Admin/components/logs";
import { Users as AdminUsers } from "../pages/Admin/components/users";
import { AdminPlans } from "../pages/Admin/components/plans";
import { AdminFeatures } from "../pages/Admin/components/features";
import { Dashboard } from "../pages/Admin/components/dashboard";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";
import { Config } from "@/pages/Admin/components/config";
import { AdminRestaurants } from "@/pages/Admin/components/restaurants";
import { AdminRestaurantStats } from "@/pages/Admin/components/restaurants/restaurantStats";
import { AdminRestaurantForm } from "@/pages/Admin/components/restaurants/restaurantForm";
import { AdminPayments } from "@/pages/Admin/components/payments";

import { ForgotPassword } from "@/pages/Authentication/ForgotPassword";
import { ResetPassword } from "@/pages/Authentication/ResetPassword";
import { Footer } from "@/components/Footer";
import { NotFound } from "@/pages/NotFound";
import { AddRestaurantWizard } from "@/pages/Account/AddRestaurant";
import { RestaurantLayout } from "@/pages/Restaurant/layout";
import { RestaurantDashboard } from "@/pages/Restaurant/Dashboard";
import { RestaurantBookings } from "@/pages/Restaurant/Bookings";
import { RestaurantClients } from "@/pages/Restaurant/Clients";
import { RestaurantSettings } from "@/pages/Restaurant/Settings";
import { RestaurantCollaborators } from "@/pages/Restaurant/Collaborators";
import { RestaurantStats } from "@/pages/Restaurant/Stats";
import { RestaurantPlan } from "@/pages/Restaurant/Plan";
import { JoinRestaurant } from "@/pages/Join";
import { PublicRestaurant } from "@/pages/PublicRestaurant";
import { PublicRestaurants } from "@/pages/Restaurants";
import { RestaurantRoleProtectedRoute } from "./RestaurantRoleProtectedRoute";
import { RestaurantGallery } from "@/pages/Restaurant/Gallery";
import { PaymentSuccess } from "@/pages/Account/PaymentSuccess";
import { PaymentCancel } from "@/pages/Account/PaymentCancel";

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
        <Route
          path="/about"
          element={
            <>
              <About />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Contact />
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
          <Route path="preferences" element={<AccountPreferences />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancel" element={<PaymentCancel />} />
        </Route>

        <Route
          path="/pro/create-restaurant"
          element={
            <ProtectedRoute authRequired={true} role="admin">
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
          <Route
            path="clients"
            element={
              <RestaurantRoleProtectedRoute roles={["admin", "manager"]}>
                <RestaurantClients />
              </RestaurantRoleProtectedRoute>
            }
          />
          <Route
            path="collaborators"
            element={
              <RestaurantRoleProtectedRoute roles={["admin", "manager"]}>
                <RestaurantCollaborators />
              </RestaurantRoleProtectedRoute>
            }
          />
          <Route
            path="stats"
            element={
              <RestaurantRoleProtectedRoute roles={["admin"]}>
                <RestaurantStats />
              </RestaurantRoleProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <RestaurantRoleProtectedRoute roles={["admin"]}>
                <RestaurantSettings />
              </RestaurantRoleProtectedRoute>
            }
          />
          <Route
            path="plan"
            element={
              <RestaurantRoleProtectedRoute roles={["admin"]}>
                <RestaurantPlan />
              </RestaurantRoleProtectedRoute>
            }
          />
          <Route
            path="gallery"
            element={
              <RestaurantRoleProtectedRoute roles={["admin", "manager"]}>
                <RestaurantGallery />
              </RestaurantRoleProtectedRoute>
            }
          />
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
          path="/forgot-password"
          element={
            <ProtectedRoute authRequired={false}>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password/:resetToken"
          element={
            <ProtectedRoute authRequired={false}>
              <ResetPassword />
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
          <Route path="plans" element={<AdminPlans />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<Config />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="restaurants/:id/stats" element={<AdminRestaurantStats />} />
          <Route path="restaurants/:id/edit" element={<AdminRestaurantForm />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
