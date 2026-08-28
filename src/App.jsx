import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

import MainLayout from "./admin/layouts/MainLayout";
import UserLayout from "./UserDashboard/layouts/UserLayout";
import DriverLayout from "./Driverdashboard/layouts/DriverLayout";

// Lazy-loaded Admin pages
const Alerts = lazy(() => import("./admin/pages/Alerts"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Drivers = lazy(() => import("./admin/pages/Drivers"));
const Navigation = lazy(() => import("./admin/pages/Navigation"));
const Rides = lazy(() => import("./admin/pages/Rides"));
const Payments = lazy(() => import("./admin/pages/Payments"));
const Settings = lazy(() => import("./admin/pages/Settings"));
const NotificationSettings = lazy(() => import("./admin/pages/settings/NotificationSettings"));
const ProfileSettings = lazy(() => import("./admin/pages/settings/ProfileSettings"));
const SecuritySettings = lazy(() => import("./admin/pages/settings/SecuritySettings"));
const SystemSettings = lazy(() => import("./admin/pages/settings/SystemSettings"));
const AdminEarnings = lazy(() => import("./admin/pages/Earnings"));
const Users = lazy(() => import("./admin/pages/Users"));
const MonthlyReport = lazy(() => import("./admin/pages/MonthlyReport"));
const AdminNotifications = lazy(() => import("./admin/pages/Notifications"));

// Lazy-loaded User pages
const UserDashboard = lazy(() => import("./UserDashboard/pages/UserDashboard"));
const RideTrackingPage = lazy(() => import("./UserDashboard/pages/RideTrackingPage"));
const EmergencySOS = lazy(() => import("./Emergency/EmergencySOS"));
const BookingPage = lazy(() => import("./UserDashboard/pages/BookingPage"));
const SchedulePage = lazy(() => import("./UserDashboard/pages/SchedulePage"));
const NotificationsPage = lazy(() => import("./UserDashboard/pages/NotificationsPage"));

// Lazy-loaded Driver pages
const DriverDashboard = lazy(() => import("./Driverdashboard/DriverDashboard"));
const DriverTrips = lazy(() => import("./Driverdashboard/DriverTrips"));
const Earnings = lazy(() => import("./Driverdashboard/Earnings"));
const DriverProfile = lazy(() => import("./Driverdashboard/DriverProfile"));
const DriverNotifications = lazy(() => import("./Driverdashboard/DriverNotifications"));

// Lazy-loaded Rider / Shared pages
const RidePage = lazy(() => import("./Ridepage/RidePage"));
const HistoryPage = lazy(() => import("./pages/history-page/HistoryPage"));
const UserProfilePage = lazy(() => import("./pages/user-profile-page/UserProfilePage"));
const CompleteRidePage = lazy(() => import("./pages/complete-ride-page/CompleteRidePage"));

// Lazy-loaded Auth pages
const LoginPage = lazy(() => import("./login/Login"));
const RegisterPage = lazy(() => import("./login/Register"));
const AdminLogin = lazy(() => import("./login/AdminLogin"));
const DriverLogin = lazy(() => import("./login/DriverLogin"));
const LoginSelector = lazy(() => import("./login/LoginSelector"));
const DriverRegister = lazy(() => import("./login/DriverRegister"));

// Minimal Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-500">Loading AccessRide...</span>
    </div>
  </div>
);

// ── Strict Session-Only Route Guards (Auto-invalidated on tab/browser close) ──
const UserProtectedRoute = () => {
  const userId = sessionStorage.getItem("user_id");
  if (!userId || userId === "0" || userId === "undefined" || userId === "null") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const AdminProtectedRoute = () => {
  const adminId = sessionStorage.getItem("admin_id");
  if (!adminId || adminId === "undefined" || adminId === "null") {
    return <Navigate to="/admin-login" replace />;
  }
  return <Outlet />;
};

const DriverProtectedRoute = () => {
  const driverId = sessionStorage.getItem("driver_id");
  if (!driverId || driverId === "0" || driverId === "undefined" || driverId === "null") {
    return <Navigate to="/driver-login" replace />;
  }
  return <Outlet />;
};

const AdminLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<LoginSelector />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver-register" element={<DriverRegister />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="navigation" element={<Navigation />} />
              <Route path="users" element={<Users />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="rides" element={<Rides />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/profile" element={<ProfileSettings />} />
              <Route path="settings/security" element={<SecuritySettings />} />
              <Route path="settings/notifications" element={<NotificationSettings />} />
              <Route path="settings/system" element={<SystemSettings />} />
              <Route path="earnings" element={<AdminEarnings />} />
              <Route path="monthly-report" element={<MonthlyReport />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            <Route path="/settings" element={<AdminLayout />}>
              <Route index element={<Settings />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="system" element={<SystemSettings />} />
            </Route>
          </Route>

          {/* Protected User (Rider) Routes */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="ride" element={<RideTrackingPage />} />
              <Route path="sos" element={<EmergencySOS />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="/complete-ride" element={<CompleteRidePage />} />
          </Route>

          {/* Protected Driver Routes */}
          <Route element={<DriverProtectedRoute />}>
            <Route path="/ride" element={<RidePage />} />
            <Route element={<DriverLayout />}>
              <Route path="/driver-dashboard" element={<DriverDashboard />} />
              <Route path="/driver-trips" element={<DriverTrips />} />
              <Route path="/driver-earnings" element={<Earnings />} />
              <Route path="/driver-profile" element={<DriverProfile />} />
              <Route path="/driver-notifications" element={<DriverNotifications />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
