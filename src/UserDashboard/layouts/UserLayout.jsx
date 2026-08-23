import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { GlobalUserVoiceAssistant } from "../components/voiceassistant/VoiceAssistant";

const UserLayout = () => {
  const location = useLocation();

  const getPageName = (path) => {
    if (path === "/user" || path === "/user/dashboard") return "Home Dashboard";
    if (path === "/user/booking") return "Booking";
    if (path === "/user/schedule") return "Schedule";
    if (path === "/user/ride") return "Ride Tracking";
    if (path === "/user/sos") return "Emergency SOS";
    if (path === "/user/history") return "Ride History";
    if (path === "/user/profile") return "Profile";
    if (path === "/user/notifications") return "Notifications";
    return "AccessRide";
  };

  const pageName = getPageName(location.pathname);

  return (
    <div className="min-h-screen bg-slate-100 pb-20 relative">
      <Outlet />
      <GlobalUserVoiceAssistant pageName={pageName} />
      <BottomNavigation />
    </div>
  );
};

export default UserLayout;
