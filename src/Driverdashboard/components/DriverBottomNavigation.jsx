import { useNavigate, useLocation } from "react-router-dom";

const DriverBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/driver-dashboard";
  const isTrips = location.pathname === "/driver-trips";
  const isEarnings = location.pathname === "/driver-earnings";

  const isProfile = location.pathname === "/driver-profile";

  return (
    <div className="fixed bottom-0 md:bottom-6 lg:bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-2xl lg:max-w-[430px] bg-white border-t md:border lg:border-x lg:border-b-0 lg:border-t border-slate-200 flex justify-around items-center py-2 md:py-3 lg:py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-2xl z-50 md:rounded-[2rem] lg:rounded-none lg:rounded-t-[2.5rem]">
      <button onClick={() => navigate("/driver-dashboard")} className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition ${isHome ? "text-[#00236F] font-bold" : "text-slate-500 hover:text-[#00236F]"}`}>
        <span className="text-xl">🏠</span>
        <p className="text-xs mt-0.5">Home</p>
      </button>
      <button onClick={() => navigate("/driver-trips")} className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition ${isTrips ? "text-yellow-500 font-bold" : "text-slate-500 hover:text-yellow-500"}`}>
        <span className="text-xl">🚗</span>
        <p className="text-xs mt-0.5">Trips</p>
      </button>
      <button onClick={() => navigate("/driver-earnings")} className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition ${isEarnings ? "text-yellow-500 font-bold" : "text-slate-500 hover:text-yellow-500"}`}>
        <span className="text-xl">💰</span>
        <p className="text-xs mt-0.5">Earnings</p>
      </button>
      <button onClick={() => navigate("/driver-profile")} className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1.5 transition ${isProfile ? "text-[#00236F] font-bold" : "text-slate-500 hover:text-[#00236F]"}`}>
        <span className="text-xl">👤</span>
        <p className="text-xs mt-0.5">Profile</p>
      </button>
    </div>
  );
};

export default DriverBottomNavigation;
