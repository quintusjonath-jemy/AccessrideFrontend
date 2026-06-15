import { useNavigate, useLocation } from "react-router-dom";

const DriverBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/driver-dashboard";
  const isTrips = location.pathname === "/driver-trips";
  const isEarnings = location.pathname === "/driver-earnings";

  return (
    <div className="flex justify-around py-3 border-t mt-auto bg-white">
      <button onClick={() => navigate("/driver-dashboard")} className={`flex flex-col items-center ${isHome ? "text-[#00236F]" : "text-gray-500 hover:text-[#00236F]"}`}>
        <span className="text-xl">🏠</span>
        <p className="text-xs">Home</p>
      </button>
      <button onClick={() => navigate("/driver-trips")} className={`flex flex-col items-center ${isTrips ? "text-yellow-500" : "text-gray-500 hover:text-[#00236F]"}`}>
        <span className="text-xl">🚗</span>
        <p className="text-xs">Trips</p>
      </button>
      <button onClick={() => navigate("/driver-earnings")} className={`flex flex-col items-center ${isEarnings ? "text-yellow-500 font-bold" : "text-gray-500 hover:text-[#00236F]"}`}>
        <span className="text-xl">💰</span>
        <p className="text-xs">Earnings</p>
      </button>
      <button onClick={() => navigate("/driver-dashboard")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
        <span className="text-xl">👤</span>
        <p className="text-xs">Profile</p>
      </button>
    </div>
  );
};

export default DriverBottomNavigation;
