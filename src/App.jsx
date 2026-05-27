import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./admin/layouts/MainLayout";
import Users from "./admin/pages/Users";
import Dashboard from "./admin/pages/Dashboard";
import Navigation from "./admin/pages/Navigation";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/navigation" element={<Navigation />} />

          <Route path="/users" element={<Users />} />
          
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
