import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";

import { AccountProfile } from "@/pages/Account/profile";
import { AccountLayout } from "@/pages/Account/layout";
import { AccountRestaurants } from "@/pages/Account/restaurants";
import { AccountBooking } from "@/pages/Account/booking";
import { AccountPreferences } from "@/pages/Account/preferences";
import { AddReview } from "@/pages/Account/AddReview";
import { MyReviews } from "@/pages/Account/MyReviews";

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
import { AdminBookings } from "@/pages/Admin/components/bookings";
import { SponsorCodes } from "../pages/Admin/SponsorCodes";

import { ForgotPassword } from "@/pages/Authentication/ForgotPassword";
import { ResetPassword } from "@/pages/Authentication/ResetPassword";
import { VerifyEmailPending } from "@/pages/Authentication/VerifyEmailPending";
import { VerifyEmail } from "@/pages/Authentication/VerifyEmail";
import { VerifyRestaurantEmail } from "@/pages/Authentication/VerifyRestaurantEmail";
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
import RestaurantTablePlan from "@/pages/Restaurant/TablePlan";
import { RestaurantReviews } from "@/pages/Restaurant/Reviews";
import { RestaurantReferral } from "@/pages/Restaurant/Referral";
import { JoinRestaurant } from "@/pages/Join";
import { PublicRestaurant } from "@/pages/PublicRestaurant";
import { PublicRestaurants } from "@/pages/Restaurants";
import { RestaurantRoleProtectedRoute } from "./RestaurantRoleProtectedRoute";
import { RestaurantGallery } from "@/pages/Restaurant/Gallery";
import { PaymentSuccess } from "@/pages/Account/PaymentSuccess";
import { PaymentCancel } from "@/pages/Account/PaymentCancel";
import { LegalLayout } from "@/pages/Legal/Layout";
import { MentionsLegales } from "@/pages/Legal/MentionsLegales";
import { Privacy } from "@/pages/Legal/Privacy";
import { Terms } from "@/pages/Legal/Terms";

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
          <Route path="add-review" element={<AddReview />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancel" element={<PaymentCancel />} />
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

        {/* Legal Pages */}
        <Route path="/legal" element={<LegalLayout />}>
          <Route path="mentions-legales" element={<MentionsLegales />} />
          <Route path="confidentialite" element={<Privacy />} />
          <Route path="cgu" element={<Terms />} />
        </Route>
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
            path="reviews"
            element={
              <RestaurantRoleProtectedRoute roles={["admin", "manager"]}>
                <RestaurantReviews />
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
            path="table-plan"
            element={
              <RestaurantRoleProtectedRoute roles={["admin", "manager"]}>
                <RestaurantTablePlan />
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
          <Route
            path="referral"
            element={
              <RestaurantRoleProtectedRoute roles={["admin"]}>
                <RestaurantReferral />
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
        <Route
          path="/verify-email-pending"
          element={
            <ProtectedRoute authRequired={false}>
              <VerifyEmailPending />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute authRequired={false}>
              <VerifyEmail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-restaurant-email/:token"
          element={
            <ProtectedRoute authRequired={false}>
              <VerifyRestaurantEmail />
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
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="sponsor-codes" element={<SponsorCodes />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
