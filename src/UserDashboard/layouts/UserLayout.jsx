import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { VoiceAssistantButton } from "../components/voiceassistant/VoiceAssistant";

const UserLayout = () => {
  const location = useLocation();
  const pagesWithInlineVoiceCard = [
    "/user",
    "/user/",
    "/user/dashboard",
    "/user/schedule",
    "/user/history",
    "/user/profile",
    "/user/booking",
    "/user/ride",
    "/user/sos",
    "/user/notifications",
  ];
  const showFloatingVoice = !pagesWithInlineVoiceCard.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-100 pb-16 relative">
      <Outlet />
      {/* Floating Voice Assistant shown only on auxiliary pages without dedicated voice UI */}
      {showFloatingVoice && <VoiceAssistantButton floating={true} />}
      <BottomNavigation />
    </div>
  );
};

export default UserLayout;
