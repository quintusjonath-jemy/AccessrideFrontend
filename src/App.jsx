import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Alerts from "./admin/pages/Alerts";
import Dashboard from "./admin/pages/Dashboard";
import Drivers from "./admin/pages/Drivers";
import Navigation from "./admin/pages/Navigation";
import Rides from "./admin/pages/Rides";
import Payments from "./admin/pages/Payments";
import Settings from "./admin/pages/Settings";
import NotificationSettings from "./admin/pages/settings/NotificationSettings";
import ProfileSettings from "./admin/pages/settings/ProfileSettings";
import SecuritySettings from "./admin/pages/settings/SecuritySettings";
import SystemSettings from "./admin/pages/settings/SystemSettings";
import AdminEarnings from "./admin/pages/Earnings";
import Users from "./admin/pages/Users";
import MonthlyReport from "./admin/pages/MonthlyReport";

import UserDashboard from "./UserDashboard/pages/UserDashboard";
import UserLayout from "./UserDashboard/layouts/UserLayout";
import RideTrackingPage from "./UserDashboard/pages/RideTrackingPage";
import EmergencySOS from "./Emergency/EmergencySOS";
import BookingPage from "./UserDashboard/pages/BookingPage";
import SchedulePage from "./UserDashboard/pages/SchedulePage";

import DriverDashboard from "./Driverdashboard/DriverDashboard";
import DriverTrips from "./Driverdashboard/DriverTrips";
import Earnings from "./Driverdashboard/Earnings";
import DriverLayout from "./Driverdashboard/layouts/DriverLayout";

import RidePage from "./Ridepage/RidePage";
import HistoryPage from "./pages/history-page/HistoryPage";
import UserProfilePage from "./pages/user-profile-page/UserProfilePage";
import CompleteRidePage from "./pages/complete-ride-page/CompleteRidePage";

import LoginPage from "./login/Login";
import RegisterPage from "./login/Register";
import AdminLogin from "./login/AdminLogin";
import DriverLogin from "./login/DriverLogin";
import LoginSelector from "./login/LoginSelector";
import DriverRegister from "./login/DriverRegister";

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
      <Routes>
        {/* admin routes under /admin prefix */}
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
        </Route>

        {/* Support non-prefixed settings links from Settings.jsx */}
        <Route path="/settings" element={<AdminLayout />}>
          <Route index element={<Settings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="system" element={<SystemSettings />} />
        </Route>

        {/* user routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="ride" element={<RideTrackingPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="sos" element={<EmergencySOS />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* driver routes */}
        <Route element={<DriverLayout />}>
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver-trips" element={<DriverTrips />} />
          <Route path="/driver-earnings" element={<Earnings />} />
        </Route>

        {/* login & register routes */}
        <Route path="/" element={<LoginSelector />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver-register" element={<DriverRegister />} />

        {/* standalone / shared routes */}
        <Route path="/ride" element={<RidePage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/complete-ride" element={<CompleteRidePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
