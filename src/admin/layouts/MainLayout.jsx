import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import VoiceCallReceiver from "../components/VoiceCallReceiver";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const adminId = localStorage.getItem("admin_id") || sessionStorage.getItem("admin_id");
    if (!adminId) {
      navigate("/admin-login");
      return;
    }

    axios
      .get("http://localhost/admin/api/settings.php?action=system")
      .then((res) => {
        if (res.data?.theme === "dark") {
          document.body.classList.add("dark");
        } else {
          document.body.classList.remove("dark");
        }
      })
      .catch((err) => {
        console.error("Failed to load theme setting in MainLayout:", err);
      });
  }, [navigate]);

  const isNavigationPage = location.pathname === "/navigation";
  const isMobilePage =
    location.pathname === "/my-rides" || location.pathname === "/profile";
  const isEmergencyPage = location.pathname === "/emergency";
  const isDriverDashboardPage = location.pathname === "/driver-dashboard";

  if (isEmergencyPage || isMobilePage || isDriverDashboardPage) {
    return <div className="w-screen min-h-screen overflow-auto">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden transition-colors duration-250">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {!isNavigationPage && <Navbar />}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
      <VoiceCallReceiver />
    </div>
  );
};

export default MainLayout;
