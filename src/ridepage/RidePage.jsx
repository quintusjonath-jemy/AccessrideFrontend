import { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiPlay, FiHome, FiSettings, FiTrendingUp } from "react-icons/fi";

const RidePage = () => {
  const [status, setStatus] = useState("new");
  const [driverOnline, setDriverOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    if (stored !== null) {
      setDriverOnline(JSON.parse(stored));
    }

    const handleStorage = (event) => {
      if (event.key === "driverOnlineStatus") {
        setDriverOnline(event.newValue ? JSON.parse(event.newValue) : false);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const ride = {
    pickup: "123 Central Library",
    drop: "Central Hospital",
    driver: "John Doe",
    vehicle: "TX-9842",
    distance: "5.2 miles",
    fare: "LKR 288.50",
    eta: "12 min",
    passengers: 2,
  };

  const statusLabel = useMemo(() => {
    switch (status) {
      case "accepted":
        return "Ride accepted — head to the pickup point.";
      case "started":
        return "Ride started — enjoy a smooth trip.";
      case "completed":
        return "Ride completed — thank you for riding with AccessRide.";
      default:
        return "New ride request received. Accept or reject to continue.";
    }
  }, [status]);

  const handleAccept = () => setStatus("accepted");
  const handleReject = () => setStatus("new");
  const handleStart = () => setStatus("started");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_46%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.15),_transparent_28%),#f8fafc] py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white/95 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 backdrop-blur-lg">
        <header className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AccessRide</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Ride Request</h1>
          </div>
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-white shadow-sm">
            <span className="text-lg">🚗</span>
          </div>
        </header>

        <section className="mt-5 rounded-3xl bg-slate-950/95 p-4 text-white shadow-[0_10px_30px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
              <p className="mt-1 text-base font-medium">{statusLabel}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${driverOnline ? "bg-emerald-500/15 text-emerald-200 ring-emerald-300/40" : "bg-rose-500/15 text-rose-200 ring-rose-300/40"}`}>
                {driverOnline ? "Driver is Online" : "Driver is Offline"}
              </span>
              <p className="mt-1 text-xs text-slate-400">Vehicle availability for passengers</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-800/80 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Pickup</p>
              <p className="mt-2 font-semibold text-white">{ride.pickup}</p>
            </div>
            <div className="rounded-3xl bg-slate-800/80 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Drop</p>
              <p className="mt-2 font-semibold text-white">{ride.drop}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-900/95 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Driver</p>
              <p className="mt-2 text-sm font-semibold text-white">{ride.driver}</p>
              <p className="mt-1 text-xs text-slate-400">Vehicle {ride.vehicle}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/95 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Details</p>
              <p className="mt-2 text-sm text-slate-300"><FiMapPin className="inline mr-2" />{ride.distance}</p>
              <p className="mt-1 text-sm text-slate-300"><FiClock className="inline mr-2" />{ride.eta} ETA</p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-slate-100/95 p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Fare</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{ride.fare}</p>
            </div>
            <div className="rounded-3xl bg-blue-500 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)]">
              {ride.passengers} Passengers
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <FiXCircle className="mr-2 text-xl text-rose-500" /> Reject
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110"
            >
              <FiCheckCircle className="mr-2 text-xl" /> Accept
            </button>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={status !== "accepted"}
            className="w-full rounded-3xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition enabled:hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiPlay className="mr-2 inline" /> Start Ride
          </button>
        </section>

        <footer className="mt-6 flex items-center justify-between rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-[0_15px_40px_rgba(15,23,42,0.15)]">
          <div>
            <p className="text-sm font-medium">Quick nav</p>
            <p className="text-xs text-slate-400">Tap to explore features</p>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <FiHome className="h-6 w-6" />
            <FiTrendingUp className="h-6 w-6" />
            <FiSettings className="h-6 w-6" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RidePage;
