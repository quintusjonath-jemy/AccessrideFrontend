import StatsCard from "../components/StatsCard";
import ActivityChart from "../components/ActivityChart";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WeeklyGrowthChart from "../components/WeeklyGrowthChart";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalRides: 0,
    activeRides: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost/admin/api/users.php")
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    axios.get("http://localhost/admin/api/rides.php")
      .then((res) => {
        setRides(Array.isArray(res.data) ? res.data : []);
      });

    axios.get("http://localhost/admin/api/dashboard_stats.php")
      .then((res) => setStats(res.data));

    axios.get("http://localhost/admin/api/alerts.php")
      .then((res) => setAlerts(Array.isArray(res.data) ? res.data : []));
  }, []);

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Monitor users, alerts and navigation activity
          </p>
        </div>

        <div className="text-sm text-gray-400 dark:text-slate-500">
          Real-time system overview
        </div>
      </div>

      {/* STATS */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        <StatsCard title="Total Users" value={users?.length || 0} color="text-blue-600 dark:text-blue-400" />
        <StatsCard title="Total Drivers" value={stats.totalDrivers} color="text-yellow-600 dark:text-yellow-400" />
        <StatsCard title="Total Rides" value={stats.totalRides} color="text-purple-600 dark:text-purple-400" />
        <StatsCard title="Active Rides" value={stats.activeRides} color="text-green-600 dark:text-green-400" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* RIDES TABLE */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-colors">

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                Ride Activity
              </h2>
              <p className="text-sm text-gray-400 dark:text-slate-400">
                Live ride monitoring and tracking
              </p>
            </div>

            <Link to="/rides">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md hover:scale-105 transition">
                View All
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                  <th className="pb-4 font-semibold">Ride ID</th>
                  <th className="pb-4 font-semibold">Driver</th>
                  <th className="pb-4 font-semibold">User</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Location</th>
                  <th className="pb-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-slate-500">
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading ride activity...
                      </div>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(rides) &&
                  [...rides]
                    .sort((a, b) => Number(b.id) - Number(a.id))
                    .slice(0, 7)
                    .map((ride) => {
                      const rideStatus = (ride.status || "").toLowerCase().trim();

                      const statusStyles = {
                        active: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
                        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
                        completed: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
                        cancelled: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                      };

                      return (
                        <tr
                          key={ride.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-4 font-semibold text-gray-800 dark:text-slate-100">
                            RID #{ride.id}
                          </td>

                          <td className="text-gray-700 dark:text-slate-300">
                            {ride.driver_name || "Unknown Driver"}
                          </td>

                          <td className="text-gray-700 dark:text-slate-300">
                            {ride.user_name || "Unknown User"}
                          </td>

                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[rideStatus] || "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"}`}>
                              {ride.status}
                            </span>
                          </td>

                          <td className="text-sm text-gray-500 dark:text-slate-400">
                            📍 {ride.pickup_location} → 🏁 {ride.dropoff_location}
                          </td>

                          <td>
                            <button
                              onClick={() =>
                                navigate("/navigation", {
                                  state: {
                                    rideId: ride.id,
                                    driverId: ride.driver_id,
                                  },
                                })
                              }
                              className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 transition"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALERTS */}
        <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-3xl shadow-lg p-6 hover:shadow-xl transition-colors">

          <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-slate-100">
            Recent Alerts
          </h2>

          <div className="space-y-4">
            {alerts.slice(0, 4).map((alert) => {
              const alertType = (alert.alert_type || "").toLowerCase().trim();

              const alertStyles = {
                sos: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400",
                low_battery: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/40 text-yellow-600 dark:text-yellow-400",
                navigation: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400",
                driver_emergency: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400",
                system: "bg-gray-50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400",
              };

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border hover:shadow-md transition-all ${
                    alertStyles[alertType] ||
                    "bg-gray-50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                  }`}
                >
                  <p className="font-semibold capitalize">
                    {alert.alert_type.replace("_", " ")}
                  </p>

                  <p className="text-sm mt-1 text-gray-500 dark:text-slate-400">
                    {alert.message}
                  </p>

                  <div className="text-xs mt-2 text-gray-500 dark:text-slate-400 space-y-1 border-t border-gray-100 dark:border-slate-700/40 pt-1.5">
                    <div>
                      <span className="font-semibold">User:</span> {alert.user_name || "Unknown"}
                      {alert.user_phone && <span className="text-gray-400 ml-1">(📞 {alert.user_phone})</span>}
                    </div>
                    {alert.user_location && (
                      <div>
                        <span className="font-semibold">📍 Location:</span> {alert.user_location}
                      </div>
                    )}
                    {alert.latitude && alert.longitude && (
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        <span>🗺️ GPS:</span> {parseFloat(alert.latitude).toFixed(5)}, {parseFloat(alert.longitude).toFixed(5)}
                      </div>
                    )}
                    {alert.driver_name && (
                      <div className="mt-1 pt-1 border-t border-gray-50 dark:border-slate-700/20">
                        <span className="font-semibold">Driver:</span> {alert.driver_name}
                        {alert.driver_phone && <span className="text-gray-400 ml-1">(📞 {alert.driver_phone})</span>}
                      </div>
                    )}
                    {alert.emergency_contact_name && (
                      <div className="mt-1 pt-1 border-t border-gray-50 dark:border-slate-700/20 text-red-650 dark:text-red-400 font-medium">
                        <span className="font-semibold">SOS Contact:</span> {alert.emergency_contact_name}
                        {alert.emergency_contact_phone && ` (${alert.emergency_contact_phone})`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 lg:col-span-3">
          <WeeklyGrowthChart />
          <ActivityChart />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;