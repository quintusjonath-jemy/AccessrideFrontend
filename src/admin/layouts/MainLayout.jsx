import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();

  const isNavigationPage = location.pathname === "/navigation";
  const isMobilePage =
    location.pathname === "/my-rides" || location.pathname === "/profile";
  const isEmergencyPage = location.pathname === "/emergency";
  const isDriverDashboardPage = location.pathname === "/driver-dashboard";
  const isMobilePage = location.pathname === "/my-rides" || location.pathname === "/profile";

  if (isEmergencyPage || isMobilePage || isDriverDashboardPage) {
    return <div className="w-screen min-h-screen overflow-auto">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {!isNavigationPage && <Navbar />}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
