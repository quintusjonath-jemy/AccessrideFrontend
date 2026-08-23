import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DriverHeader from "./components/DriverHeader";
import API_BASE from "../config/api";

const Earnings = () => {
  const navigate = useNavigate();

  const [isOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : true;
  });

  const [driverInfo, setDriverInfo] = useState({ first_name: "Driver", last_name: "", profile_image: "" });
  const [statistics, setStatistics] = useState({ weekly_earnings: 0, weekly_trips: 0 });
  const [recentRides, setRecentRides] = useState([]);

  useEffect(() => {
    const driverId = sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }
    fetch(`${API_BASE}/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { driver, statistics, recent_rides } = res.data;
          if (driver) {
            setDriverInfo(driver);
          }
          if (statistics) {
            setStatistics(statistics);
          }
          if (recent_rides) {
            setRecentRides(recent_rides);
          }
        }
      })
      .catch((err) => console.error("Error fetching earnings data:", err));
  }, []);

  const transactions = useMemo(() => {
    return recentRides.map((ride) => {
      try {
        const date = new Date(ride.ride_date.replace(/-/g, "/"));
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const dayStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return {
          time: `${dayStr}, ${timeStr}`,
          trip: `Trip #AR-${ride.id}`,
          amount: `+ Rs. ${parseFloat(ride.fare).toFixed(2)}`
        };
      } catch (e) {
        return {
          time: ride.ride_date,
          trip: `Trip #AR-${ride.id}`,
          amount: `+ Rs. ${parseFloat(ride.fare).toFixed(2)}`
        };
      }
    });
  }, [recentRides]);

  const estimatedHours = Math.round((statistics.weekly_trips || 0) * 0.8);

  return (
    <>
      <DriverHeader driverInfo={driverInfo} />

      <div className="bg-gray-100 p-4">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-[#00236F] font-bold">Hello, {driverInfo.first_name}</h2>
            <p className="text-sm text-gray-600">Weekly earnings summary</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Status</p>
            <p className={`font-bold ${isOnline ? "text-emerald-600" : "text-rose-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#00236F] text-white p-5 rounded-2xl m-3 shadow-lg">
        <p className="text-sm opacity-80">Active Period</p>
        <h2 className="text-2xl font-semibold mb-3">Weekly Earnings</h2>
        <div className="text-4xl font-bold mb-4">Rs. {Number(statistics.weekly_earnings || 0).toFixed(2)}</div>
        <div className="bg-blue-800 p-3 rounded-xl flex justify-between items-center">
          <span>Payout scheduled: Mon</span>
          <span className="text-xl">📅</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Trips</p>
          <h2 className="text-2xl font-bold">{statistics.weekly_trips || 0}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Online</p>
          <h2 className="text-2xl font-bold">{estimatedHours}h</h2>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow mx-3 mb-4">
        <p className="font-semibold mb-3">Earnings Breakdown</p>
        <div className="h-28 bg-gray-200 rounded-3xl flex items-center justify-center text-gray-500">
          Chart preview here
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow mx-3 mb-4">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Recent Transactions</h2>
          <button className="text-[#00236F] text-sm font-medium">View All</button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent transactions found.</p>
          ) : (
            transactions.map((txn) => (
              <div key={txn.trip} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{txn.time}</p>
                  <p className="text-sm text-gray-500">{txn.trip}</p>
                </div>
                <p className="text-green-600 font-semibold">{txn.amount}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow mx-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Need help with earnings?</span>
          <button className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-[#00236F] font-semibold">Get Support</button>
        </div>
      </div>

    </>
  );
};

export default Earnings;
