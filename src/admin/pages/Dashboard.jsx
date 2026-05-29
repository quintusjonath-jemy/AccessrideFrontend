import StatsCard from "../components/StatsCard";
import ActivityChart from "../components/ActivityChart";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import WeeklyGrowthChart from "../components/WeeklyGrowthChart";

function Dashboard() {
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
    // USERS
    axios
      .get("http://localhost/admin/api/users.php")

      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })

      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    // RIDES
    axios
      .get("http://localhost/admin/api/rides.php")

      .then((res) => {
        setRides(Array.isArray(res.data) ? res.data : []);
      })

      .catch((err) => {
        console.log(err);
      });

    // DASHBOARD STATS
    axios
      .get("http://localhost/admin/api/dashboard_stats.php")

      .then((res) => {
        setStats(res.data);
      })

      .catch((err) => {
        console.log(err);
      });

    axios
      .get("http://localhost/admin/api/alerts.php")

      .then((res) => {
        setAlerts(Array.isArray(res.data) ? res.data : []);
      })

      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <p className="text-gray-500 mt-1">
            Monitor users, alerts and navigation activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">
        <StatsCard
          title="Total Users"
          value={users?.length || 0}
          color="text-blue-600"
        />

        <StatsCard
          title="Total Drivers"
          value={stats.totalDrivers}
          color="text-yellow-600"
        />

        <StatsCard
          title="Total Rides"
          value={stats.totalRides}
          color="text-purple-600"
        />

        <StatsCard
          title="Active Rides"
          value={stats.activeRides}
          color="text-green-600"
        />
      </div>

      {/* Main Content */}

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        {/* Ride Activity */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Ride Activity</h2>

              <p className="text-sm text-gray-400 mt-1">
                Live ride monitoring and tracking
              </p>
            </div>

            <Link to="/rides">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                View All
              </button>
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Ride ID</th>

                <th>Driver</th>

                <th>User</th>

                <th>Status</th>

                <th className="px-7">Location</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* Ride ID */}

                      <td className="py-4 font-semibold text-gray-800">
                        RID #{ride.id}
                      </td>

                      {/* Driver */}

                      <td className="text-gray-700 font-medium">
                        {ride.driver_name || "Unknown Driver"}
                      </td>

                      {/* User */}

                      <td className="text-gray-700 font-medium">
                        {ride.user_name || "Unknown User"}
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[rideStatus] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ride.status}
                        </span>
                      </td>

                      {/* Location */}

                      <td className="px-6 py-4 text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            📍 {ride.pickup_location}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-red-500">
                            🏁 {ride.dropoff_location}
                          </div>
                        </div>
                      </td>

                      {/* Action */}

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
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition"
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

        {/* Alerts Panel */}

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-xl font-bold mb-5">Recent Alerts</h2>

          <div className="space-y-4">
            {alerts.slice(0, 4).map((alert) => {
              const alertType = (alert.alert_type || "").toLowerCase().trim();

              const alertStyles = {
                sos: "bg-red-50 border-red-200 text-red-600",

                low_battery: "bg-yellow-50 border-yellow-200 text-yellow-600",

                navigation: "bg-blue-50 border-blue-200 text-blue-600",

                driver_emergency:
                  "bg-orange-50 border-orange-200 text-orange-600",

                system: "bg-gray-50 border-gray-200 text-gray-600",
              };

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alertStyles[alertType] ||
                    "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {/* Alert Title */}
                  <p className="font-semibold capitalize">
                    {alert.alert_type.replace("_", " ")}
                  </p>

                  {/* Message */}
                  <p className="text-sm mt-1 text-gray-500">{alert.message}</p>

                  {/* User */}
                  <p className="text-xs mt-2 text-gray-400">
                    User: {alert.user_name || "Unknown"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}

        <div className="grid lg:grid-cols-2 gap-5 mt-4 lg:col-span-3">
          <WeeklyGrowthChart />

          <ActivityChart />
        </div>

        {/* {selectedUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-[400px] rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">User Details</h2>

              <div className="space-y-2 text-gray-700">
                <p>
                  <b>Name:</b> {selectedUser.name || selectedUser.user_name}
                </p>
                <p>
                  <b>Email:</b> {selectedUser.email}
                </p>
                <p>
                  <b>Status:</b> {selectedUser.status}
                </p>
                <p>
                  <b>Location:</b> {selectedUser.location}
                </p>
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default Dashboard;
