import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Alerts from "./admin/pages/Alerts";
import Dashboard from "./admin/pages/Dashboard";
import Drivers from "./admin/pages/Drivers";
import Navigation from "./admin/pages/Navigation";
import Rides from "./admin/pages/Rides";
import RidePage from "./Ridepage/RidePage";
import DriverDashboard from "./Driverdashboard/DriverDashboard";
import DriverTrips from "./Driverdashboard/DriverTrips";
import Earnings from "./Driverdashboard/Earnings";
import EmergencySOS from "./Emergency/EmergencySOS";
import Settings from "./admin/pages/Settings";
import NotificationSettings from "./admin/pages/settings/NotificationSettings";
import ProfileSettings from "./admin/pages/settings/ProfileSettings";
import SecuritySettings from "./admin/pages/settings/SecuritySettings";
import SystemSettings from "./admin/pages/settings/SystemSettings";
import Users from "./admin/pages/Users";
// import MyRides from "./history-page/Index";
// import CustomerProfile from "./history-page/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/navigation" element={<Navigation />} />

          <Route path="/users" element={<Users />} />

          <Route path="/alerts" element={<Alerts />} />

          <Route path="/drivers" element={<Drivers />} />

          <Route path="/rides" element={<Rides />} />
          <Route path="/ride" element={<RidePage />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver-trips" element={<DriverTrips />} />
          <Route path="/driver-earnings" element={<Earnings />} />
          <Route path="/emergency" element={<EmergencySOS />} />

          {/* <Route path="/my-rides" element={<MyRides />} /> */}

          {/* <Route path="/profile" element={<CustomerProfile />} /> */}

          <Route path="/settings" element={<Settings />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/settings/profile" element={<ProfileSettings />} />

          <Route path="/settings/security" element={<SecuritySettings />} />

          <Route
            path="/settings/notifications"
            element={<NotificationSettings />}
          />

          <Route path="/settings/system" element={<SystemSettings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
