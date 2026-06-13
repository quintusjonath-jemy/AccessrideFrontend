import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// import MainLayout from "./admin/layouts/MainLayout";
// import Alerts from "./admin/pages/Alerts";
// import Dashboard from "./admin/pages/Dashboard";
// import Drivers from "./admin/pages/Drivers";
// import Navigation from "./admin/pages/Navigation";
// import Rides from "./admin/pages/Rides";
// import Settings from "./admin/pages/Settings";
// import NotificationSettings from "./admin/pages/settings/NotificationSettings";
// import ProfileSettings from "./admin/pages/settings/ProfileSettings";
// import SecuritySettings from "./admin/pages/settings/SecuritySettings";
// import SystemSettings from "./admin/pages/settings/SystemSettings";
// import Users from "./admin/pages/Users";

import UserDashboard from "./UserDashboard/pages/UserDashboard";
import UserLayout from "./UserDashboard/layouts/UserLayout";
import RidePage from "./Ridepage/RidePage";
import EmergencySOS from "./Emergency/EmergencySOS";

const App = () => {
  return (
    <BrowserRouter>
      {/* <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/navigation" element={<Navigation />} />

          <Route path="/users" element={<Users />} />

          <Route path="/alerts" element={<Alerts />} />

          <Route path="/drivers" element={<Drivers />} />

          <Route path="/rides" element={<Rides />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/settings/profile" element={<ProfileSettings />} />

          <Route path="/settings/security" element={<SecuritySettings />} />

          <Route
            path="/settings/notifications"
            element={<NotificationSettings />}
          />

          <Route path="/settings/system" element={<SystemSettings />} />
        </Routes>
      </MainLayout> */}

      <Routes>
        {/* redirect root */}
        <Route path="/" element={<Navigate to="/user/dashboard" />} />

        {/* user routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="ride" element={<RidePage />} />
          <Route path="sos" element={<EmergencySOS />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
