import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Alerts from "./admin/pages/Alerts";
import Dashboard from "./admin/pages/Dashboard";
import Navigation from "./admin/pages/Navigation";
import Users from "./admin/pages/Users";
import Drivers from "./admin/pages/Drivers";
import Rides from "./admin/pages/Rides";
import Settings from "./admin/pages/Settings";

function App() {
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

          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
