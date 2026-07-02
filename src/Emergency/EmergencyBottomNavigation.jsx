import { Calendar, Home, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const EmergencyBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/user/dashboard" || location.pathname === "/user";
  const isSchedule = location.pathname === "/user/schedule";

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 flex justify-around items-center py-2 shadow-lg z-50 md:rounded-b-[2.5rem] md:border-b md:border-x">
      {/* Home */}
      <button
        onClick={() => navigate("/user/dashboard")}
        className={`flex flex-col items-center justify-center rounded-2xl px-6 py-1.5 transition cursor-pointer ${
          isHome
            ? "bg-[#FEC329] text-slate-900 font-bold shadow-sm"
            : "text-slate-500 font-medium hover:text-slate-900"
        }`}
      >
        <Home size={20} className={isHome ? "text-slate-900" : "text-slate-500"} />
        <span className="text-xs mt-0.5">Home</span>
      </button>

      {/* Schedule */}
      <button
        onClick={() => navigate("/user/schedule")}
        className={`flex flex-col items-center justify-center rounded-2xl px-6 py-1.5 transition cursor-pointer ${
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
        onClick={() => navigate("/user/dashboard")}
        className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 font-medium transition cursor-pointer px-6 py-1.5"
      >
        <User size={20} />
        <span className="text-xs mt-0.5">Profile</span>
      </button>
    </div>
  );
};

export default EmergencyBottomNavigation;
