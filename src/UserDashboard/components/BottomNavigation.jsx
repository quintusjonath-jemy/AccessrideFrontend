import { Calendar, Home, User, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/user/dashboard" || location.pathname === "/user";
  const isSchedule = location.pathname === "/user/schedule";
  const isHistory = location.pathname === "/history";
  const isProfile = location.pathname === "/profile";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center py-2 shadow-lg z-50">
      {/* Home */}
      <button
        onClick={() => navigate("/user/dashboard")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer ${
          isHome
            ? "bg-[#FEC329] text-slate-900 font-bold shadow-sm"
            : "text-slate-500 font-medium hover:text-slate-900"
        }`}
      >
        <Home size={20} className={isHome ? "text-slate-900" : "text-slate-500"} />
        <span className="text-xs mt-0.5">Home</span>
      </button>

      {/* My Rides */}
      <button
        onClick={() => navigate("/history")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer ${
          isHistory
            ? "bg-[#FEC329] text-slate-900 font-bold shadow-sm"
            : "text-slate-500 font-medium hover:text-slate-900"
        }`}
      >
        <Clock size={20} className={isHistory ? "text-slate-900" : "text-slate-500"} />
        <span className="text-xs mt-0.5">My Rides</span>
      </button>

      {/* Schedule */}
      <button
        onClick={() => navigate("/user/schedule")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer ${
          isSchedule
            ? "bg-[#FEC329] text-slate-900 font-bold shadow-sm"
            : "text-slate-500 font-medium hover:text-slate-900"
        }`}
      >
        <Calendar size={20} className={isSchedule ? "text-slate-900" : "text-slate-500"} />
        <span className="text-xs mt-0.5">Schedule</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => navigate("/profile")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer ${
          isProfile
            ? "bg-[#FEC329] text-slate-900 font-bold shadow-sm"
            : "text-slate-500 font-medium hover:text-slate-900"
        }`}
      >
        <User size={20} className={isProfile ? "text-slate-900" : "text-slate-500"} />
        <span className="text-xs mt-0.5">Profile</span>
      </button>
    </div>
  );
};

export default BottomNavigation;
