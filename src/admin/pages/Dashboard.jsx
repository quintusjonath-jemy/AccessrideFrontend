import StatsCard from "../components/StatsCard";
import ActivityChart from "../components/ActivityChart";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalRides: 0,
    activeRides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // USERS
    axios
      .get("http://localhost/admin/api/users.php")

      .then((res) => {
        console.log(res.data);
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })

      .catch((err) => {
        console.log(err);
        setLoading(false);
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

  const statusStyles = {
    active: "bg-green-100 text-green-700",
    emergency: "bg-red-100 text-red-600",
    navigating: "bg-yellow-100 text-yellow-700",
  };

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

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        {/* Activity Table */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5">
          <div className="flex justify-between mb-5">
            <h2 className="text-xl font-bold">User Activity</h2>

            <Link to="/users">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                View All
              </button>
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">User</th>
                <th>status</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading user activity...
                    </div>
                  </td>
                </tr>
              ) : (
                Array.isArray(users) &&
                users.slice(0, 5).map((user) => {
                  const status = (user.status || "").toLowerCase().trim();

                  return (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* User */}
                      <td className="py-4 font-medium text-gray-800">
                        {user.name || user.user_name}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.status || "unknown"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="text-gray-500">
                        📍 {user.location || "Unknown"}
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition"
                        >
                          View
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
            {alerts.slice(0, 5).map((alert) => {
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

        <div className="mt-8">
          <ActivityChart />
        </div>

        {selectedUser && (
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
        )}
      </div>
    </div>
  );
}

export default Dashboard;
