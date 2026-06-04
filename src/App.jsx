import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Users from "./admin/pages/Users";
import Dashboard from "./admin/pages/Dashboard";
import Navigation from "./admin/pages/Navigation";
import LoginPage from "./login/Login";
import RegisterPage from "./login/Register";
import AdminLogin from "./login/AdminLogin";
import DriverLogin from "./login/DriverLogin";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/navigation" element={<Navigation />} />

          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/driver-login" element={<DriverLogin />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
