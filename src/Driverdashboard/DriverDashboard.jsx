import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiMapPin, FiClock, FiDollarSign, FiUser, FiTruck } from "react-icons/fi";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : true;
  });
  const [rideRequest, setRideRequest] = useState({
    pickup: "Colombo Public Library",
    dropoff: "National Hospital, Colombo",
    distance: "8.4 km",
    duration: "14 mins",
    fare: "Rs. 672.00",
  });

  useEffect(() => {
    fetch("http://localhost/AccessrideBackend/DriverdashboardgetRide.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.pickup && data.dropoff) {
          setRideRequest((current) => ({
            ...current,
            pickup: data.pickup,
            dropoff: data.dropoff,
          }));
        }
      })
      .catch(() => {
        // ignore fetch errors for now
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("driverOnlineStatus", JSON.stringify(isOnline));
  }, [isOnline]);

  const toggleStatus = () => setIsOnline((value) => !value);

  const acceptRide = () => {
    fetch("http://localhost/AccessrideBackend/accept.php", { method: "POST" });
    alert("Ride Accepted");
  };

  const rejectRide = () => {
    fetch("http://localhost/AccessrideBackend/Driverdashboard/reject.php", { method: "POST" });
    alert("Ride Rejected");
  };

  const navItems = [
    { label: "Home", icon: FiHome, active: true },
    { label: "Trips", icon: FiTruck, active: false },
    { label: "Earnings", icon: FiDollarSign, active: false },
    { label: "Profile", icon: FiUser, active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-6 flex justify-center px-3 sm:px-6">
      <div className="mx-auto w-full max-w-[430px] min-h-[932px] flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">🚕 AccessRide</h1>
              <p className="text-sm text-slate-500">Driver dashboard</p>
            </div>
            <img src="/src/Driverdashboard/drivering.webp" alt="Driver avatar" className="h-10 w-10 rounded-full object-cover" />
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-5">
          <div className="flex items-start justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-900">Good Morning, John</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">⭐ 4.8</span>
                <span>1,240 Trips</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Today's Earnings</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">Rs. 142.50</p>
              <p className="text-xs text-slate-500">9 Trips completed</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
                <p className="text-sm font-medium">Status: {isOnline ? "Online" : "Offline"}</p>
              </div>
              <button
                onClick={toggleStatus}
                className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`}
              >
                <span className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform ${isOnline ? "translate-x-7" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="mt-4 rounded-3xl bg-slate-950 p-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current Request</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.2em] text-slate-400">Pickup</p>
                  <p className="mt-2 text-sm font-semibold">{rideRequest.pickup}</p>
                </div>
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.2em] text-slate-400">Dropoff</p>
                  <p className="mt-2 text-sm font-semibold">{rideRequest.dropoff}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-3xl bg-white/10 px-3 py-2">
                    <FiMapPin /> {rideRequest.distance}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-3xl bg-white/10 px-3 py-2">
                    <FiClock /> {rideRequest.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] overflow-hidden bg-slate-200">
            <img src="/src/Driverdashboard/map.jpg" alt="Map preview" className="h-56 w-full object-cover opacity-85" />
          </div>

          <div className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">NEW REQUEST</p>
              <p className="text-lg font-bold text-slate-900">{rideRequest.fare}</p>
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-slate-400">Pickup</p>
                <p className="font-medium text-slate-900">{rideRequest.pickup}</p>
              </div>
              <div>
                <p className="text-slate-400">Dropoff</p>
                <p className="font-medium text-slate-900">{rideRequest.dropoff}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>📍 {rideRequest.distance}</span>
                <span>⏱ {rideRequest.duration}</span>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={rejectRide}
                className="rounded-3xl border border-rose-500 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                REJECT
              </button>
              <button
                onClick={acceptRide}
                className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                ACCEPT RIDE
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-around py-3 border-t mt-auto bg-white">
          <button onClick={() => navigate("/driver-dashboard")} className="flex flex-col items-center text-[#00236F]">
            <span className="text-xl">🏠</span>
            <p className="text-xs">Home</p>
          </button>
          <button onClick={() => navigate("/driver-trips")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">🚗</span>
            <p className="text-xs">Trips</p>
          </button>
          <button onClick={() => navigate("/driver-earnings")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">💰</span>
            <p className="text-xs">Earnings</p>
          </button>
          <button onClick={() => navigate("/driver-dashboard")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">👤</span>
            <p className="text-xs">Profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
