import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();

  // CHECK NAVIGATION PAGE
  const isNavigationPage = location.pathname === "/navigation";

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        {!isNavigationPage && <Navbar />}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default MainLayout;
