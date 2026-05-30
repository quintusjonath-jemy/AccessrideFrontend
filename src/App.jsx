import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Users from "./admin/pages/Users";
import Dashboard from "./admin/pages/Dashboard";
import Navigation from "./admin/pages/Navigation";
import LoginPage from "./login/Login";
import RegisterPage from "./login/Register";

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
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
