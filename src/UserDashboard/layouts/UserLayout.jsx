import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { VoiceAssistantButton } from "../components/voiceassistant/VoiceAssistant";

const UserLayout = () => {
  const location = useLocation();
  const isDashboard =
    location.pathname === "/user/dashboard" ||
    location.pathname === "/user" ||
    location.pathname === "/user/";

  return (
    <div className="min-h-screen bg-slate-100 pb-16 relative">
      <Outlet />
      {/* Floating Voice Assistant on all user pages (Schedule, History/My Rides, Profile, Notifications, SOS) */}
      {!isDashboard && <VoiceAssistantButton floating={true} />}
      <BottomNavigation />
    </div>
  );
};

export default UserLayout;
