import { Calendar, Home, User, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/user/dashboard" || location.pathname === "/user";
  const isSchedule = location.pathname === "/user/schedule";
  const isHistory = location.pathname === "/user/history";
  const isProfile = location.pathname === "/user/profile";

  return (
    <div className="fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full md:max-w-md lg:max-w-lg bg-white border-t md:border border-slate-200 flex justify-around items-center py-2 md:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-2xl z-50 md:rounded-[2rem] transition-all duration-300">
      {/* Home */}
      <button
        onClick={() => navigate("/user/dashboard")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
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
        onClick={() => navigate("/user/history")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
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
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
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
        onClick={() => navigate("/user/profile")}
        className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition cursor-pointer hover:scale-105 active:scale-95 ${
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
