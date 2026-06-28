import axios from "axios";
import { useEffect, useState } from "react";
import LiveMap from "../components/LiveMap";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPinned, Navigation, Car, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const NavigationPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([79.8612, 6.9271]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [showDriversOnly, setShowDriversOnly] = useState(false);
  const [deviations, setDeviations] = useState({});
  const [lastDeviationCount, setLastDeviationCount] = useState(0);

  const location = useLocation();
  const trackedRide = location.state?.rideId;
  const trackedDriver = location.state?.driverId;
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost/admin/api/stream.php?type=rides");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRides(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to parse rides stream data:", err);
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Navigation SSE connection error:", err);
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Play alarm sound when a new deviation is detected
  const playDeviationSound = () => {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    audio.play().catch((e) => console.log("Sound play error:", e));
  };

  useEffect(() => {
    const deviationCount = Object.keys(deviations).length;
    if (deviationCount > lastDeviationCount) {
      playDeviationSound();
    }
    setLastDeviationCount(deviationCount);
  }, [deviations, lastDeviationCount]);

  // Centering on tracked driver ride if available on initial fetch
  useEffect(() => {
    if (trackedDriver && rides.length > 0) {
      const activeRide = rides.find((r) => r.driver_id == trackedDriver);
      if (activeRide && activeRide.longitude && activeRide.latitude) {
        setMapCenter([parseFloat(activeRide.longitude), parseFloat(activeRide.latitude)]);
      }
    }
  }, [rides, trackedDriver]);

  const filteredRides = rides.filter((ride) => {
    const matchesDriver = !trackedDriver || ride.driver_id == trackedDriver;
    const matchesStatus =
      statusFilter === "all" ||
      ride.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(ride.id).includes(searchLower) ||
      (ride.user_name || "").toLowerCase().includes(searchLower) ||
      (ride.driver_name || "").toLowerCase().includes(searchLower) ||
      (ride.pickup_location || "").toLowerCase().includes(searchLower) ||
      (ride.dropoff_location || "").toLowerCase().includes(searchLower);

    return matchesDriver && matchesStatus && matchesSearch;
  });

  const statusColors = {
    all: { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900/30", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/40" },
    pending: { bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-100 dark:border-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", iconBg: "bg-yellow-100 dark:bg-yellow-900/40" },
    accepted: { bg: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-100 dark:border-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
    active: { bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-100 dark:border-green-900/30", text: "text-green-600 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/40" },
    completed: { bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/40" },
    cancelled: { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-100 dark:border-red-900/30", text: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/40" }
  };
  const theme = statusColors[statusFilter] || statusColors.all;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Navigation Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Monitor live ride tracking and driver movement
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">

          {/* LIVE BADGE */}
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 dark:border-green-900/50 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            LIVE TRACKING
          </div>

          {/* BUTTON */}
          <button
            onClick={() => setShowDriversOnly(!showDriversOnly)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition"
          >
            <Navigation className="w-4 h-4" />
            {showDriversOnly ? "Live Navigation" : "Drivers Location"}
          </button>

        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="relative h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">

        {/* MAP */}
        <LiveMap 
          rides={filteredRides} 
          center={mapCenter} 
          driversOnly={showDriversOnly} 
          onDeviationsChange={setDeviations}
        />

        {/* LEFT FLOAT PANEL */}
        {isPanelExpanded ? (
          <div className="absolute top-5 left-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl p-6 w-80 border border-gray-100 dark:border-slate-800 z-10 max-h-[80vh] overflow-y-auto transition-all duration-300">
            {/* PANEL HEADER WITH COLLAPSE BUTTON */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-150 flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Live Overview
              </h2>
              <button
                onClick={() => setIsPanelExpanded(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-350 rounded-lg transition"
                title="Hide Overview"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* DEVIATION WARNING BANNER */}
            {Object.keys(deviations).length > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3.5 rounded-xl text-xs space-y-1.5 animate-pulse">
                <div className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <span>🚨</span> ROUTE DEVIATION DETECTED
                </div>
                <div className="text-gray-650 dark:text-slate-350 text-[11px] leading-relaxed">
                  {Object.entries(deviations).map(([id, info]) => (
                    <div key={id} className="border-t border-red-100 dark:border-red-955/40 pt-1 mt-1 font-medium">
                      Ride #{id} (Driver {info.driver_name}) is <strong>{info.distance.toFixed(2)} km</strong> off course!
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DRIVER TRACKING BADGE */}
            {trackedDriver && (
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/40 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Tracking Driver ID</p>
                  <p className="text-sm font-bold text-yellow-750 dark:text-yellow-450">#{trackedDriver}</p>
                </div>
                <button
                  onClick={() => navigate("/admin/navigation", { replace: true, state: {} })}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 text-yellow-800 dark:text-yellow-400 px-2.5 py-1.5 rounded-lg transition font-medium"
                >
                  Show All
                </button>
              </div>
            )}

            {/* STATUS FILTER */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Filter Status on Map
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-150 shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-800">⚙️ All Statuses</option>
                  <option value="pending" className="dark:bg-slate-800">⏳ Pending</option>
                  <option value="accepted" className="dark:bg-slate-800">✅ Accepted</option>
                  <option value="active" className="dark:bg-slate-800">🚖 Active</option>
                  <option value="completed" className="dark:bg-slate-800">🏁 Completed</option>
                  <option value="cancelled" className="dark:bg-slate-800">❌ Cancelled</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Search Rides
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user, driver, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 text-sm shadow-sm transition text-gray-800 dark:text-slate-150"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-350"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* RIDES LIST SECTION */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Matching Rides ({filteredRides.length})
              </label>
              {filteredRides.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-gray-100 dark:border-slate-800 rounded-xl p-1 bg-gray-50/50 dark:bg-slate-850/50">
                  {filteredRides.slice(0, 15).map((ride) => {
                    const isSelected = mapCenter[0] === parseFloat(ride.longitude) && mapCenter[1] === parseFloat(ride.latitude);
                    return (
                      <div
                        key={ride.id}
                        onClick={() => {
                          const lng = parseFloat(ride.longitude);
                          const lat = parseFloat(ride.latitude);
                          if (lng && lat) {
                            setMapCenter([lng, lat]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 flex justify-between items-center ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 shadow-sm font-semibold"
                            : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750/50 border-gray-100 dark:border-slate-700"
                        }`}
                      >
                        <div className="truncate flex-1 pr-2">
                          <p className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                            Ride #{ride.id}
                            {!!deviations[ride.id] && (
                              <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                                Off-Route
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 dark:text-slate-400 truncate mt-0.5 text-[11px]">
                            👤 {ride.user_name || "Unknown"}
                          </p>
                          <p className="text-gray-400 dark:text-slate-450 truncate text-[10px]">
                            📍 {ride.pickup_location}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] capitalize shrink-0 ${
                          ride.status?.toLowerCase() === "active" ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400" :
                          ride.status?.toLowerCase() === "pending" ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-755 dark:text-yellow-400" :
                          ride.status?.toLowerCase() === "completed" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" :
                          "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-350"
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-900/40 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                  No matching rides on map
                </div>
              )}
            </div>

            {/* DYNAMIC RIDES COUNT */}
            <div className={`flex items-center justify-between ${theme.bg} p-4 rounded-xl border ${theme.border} mb-4 transition-all duration-300`}>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider capitalize">
                  {statusFilter === "all" ? "Total" : statusFilter} Rides
                </p>
                <h3 className={`text-2xl font-bold ${theme.text} mt-0.5`}>
                  {filteredRides.length}
                </h3>
              </div>

              <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center transition-all duration-300`}>
                <Car className={`${theme.text} w-6 h-6`} />
              </div>
            </div>

            {/* STATUS LIST */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-650 dark:text-slate-300 bg-gray-50 dark:bg-slate-850 p-3 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Drivers Online Tracking Active
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-655 dark:text-slate-300 bg-gray-50 dark:bg-slate-850 p-3 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                SOS Emergency Monitoring Enabled
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-650 dark:text-slate-300 bg-gray-50 dark:bg-slate-850 p-3 rounded-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Real-time GPS Updates Running
              </div>
            </div>
          </div>
        ) : (
          /* COLLAPSED FLOAT PANEL BUTTON */
          <button
            onClick={() => setIsPanelExpanded(true)}
            className="absolute top-5 left-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-slate-800 z-10 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-350 font-bold text-gray-800 dark:text-slate-200 text-sm shadow-md"
            title="Show Overview"
          >
            <MapPinned className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Show Overview
            <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
          </button>
        )}

        {/* BOTTOM RIGHT SMALL PANEL */}
        <div className="absolute bottom-5 right-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-slate-800 text-sm text-gray-600 dark:text-slate-400">
          System Status: <span className="text-green-600 font-semibold">Healthy</span>
        </div>

      </div>
    </div>
  );
};

export default NavigationPage;