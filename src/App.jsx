import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import Navigation from "./pages/Navigation";

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
