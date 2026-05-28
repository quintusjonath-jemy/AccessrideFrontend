import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Alerts from "./admin/pages/Alerts";
import Dashboard from "./admin/pages/Dashboard";
import Navigation from "./admin/pages/Navigation";
import Users from "./admin/pages/Users";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/navigation" element={<Navigation />} />

          <Route path="/users" element={<Users />} />

          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
