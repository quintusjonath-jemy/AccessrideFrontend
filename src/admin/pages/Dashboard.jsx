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
      <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor users, alerts and navigation activity
          </p>
        </div>

        <div className="text-sm text-gray-400">
          Real-time system overview
        </div>
      </div>

      {/* STATS */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        <StatsCard title="Total Users" value={users?.length || 0} color="text-blue-600" />
        <StatsCard title="Total Drivers" value={stats.totalDrivers} color="text-yellow-600" />
        <StatsCard title="Total Rides" value={stats.totalRides} color="text-purple-600" />
        <StatsCard title="Active Rides" value={stats.activeRides} color="text-green-600" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* RIDES TABLE */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl shadow-lg p-6 hover:shadow-xl transition">

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Ride Activity
              </h2>
              <p className="text-sm text-gray-400">
                Live ride monitoring and tracking
              </p>
            </div>

            <Link to="/rides">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-xl shadow-md hover:scale-105 transition">
                View All
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-4 font-semibold">Ride ID</th>
                  <th className="pb-4 font-semibold">Driver</th>
                  <th className="pb-4 font-semibold">User</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Location</th>
                  <th className="pb-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading ride activity...
                      </div>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(rides) &&
                  rides.slice(0, 5).map((ride) => {
                    const rideStatus = (ride.status || "").toLowerCase().trim();

                    const statusStyles = {
                      active: "bg-green-100 text-green-700",
                      pending: "bg-yellow-100 text-yellow-700",
                      completed: "bg-blue-100 text-blue-700",
                      cancelled: "bg-red-100 text-red-700",
                    };

                    return (
                      <tr
                        key={ride.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 font-semibold text-gray-800">
                          RID #{ride.id}
                        </td>

                        <td className="text-gray-700">
                          {ride.driver_name || "Unknown Driver"}
                        </td>

                        <td className="text-gray-700">
                          {ride.user_name || "Unknown User"}
                        </td>

                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[rideStatus] || "bg-gray-100 text-gray-700"}`}>
                            {ride.status}
                          </span>
                        </td>

                        <td className="text-sm text-gray-500">
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
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 hover:scale-105 transition"
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
        <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl shadow-lg p-6 hover:shadow-xl transition">

          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Recent Alerts
          </h2>

          <div className="space-y-4">
            {alerts.slice(0, 4).map((alert) => {
              const alertType = (alert.alert_type || "").toLowerCase().trim();

              const alertStyles = {
                sos: "bg-red-50 border-red-200 text-red-600",
                low_battery: "bg-yellow-50 border-yellow-200 text-yellow-600",
                navigation: "bg-blue-50 border-blue-200 text-blue-600",
                driver_emergency: "bg-orange-50 border-orange-200 text-orange-600",
                system: "bg-gray-50 border-gray-200 text-gray-600",
              };

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border hover:shadow-md transition ${
                    alertStyles[alertType] ||
                    "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <p className="font-semibold capitalize">
                    {alert.alert_type.replace("_", " ")}
                  </p>

                  <p className="text-sm mt-1 text-gray-500">
                    {alert.message}
                  </p>

                  <p className="text-xs mt-2 text-gray-400">
                    User: {alert.user_name || "Unknown"}
                  </p>
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