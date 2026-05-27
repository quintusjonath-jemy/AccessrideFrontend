import StatsCard from "../components/StatsCard";
import ActivityChart from "../components/ActivityChart";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          title="Active 
          Devices"
          value="842"
          color="text-green-600"
        />

        <StatsCard title="SOS Alerts" value="12" color="text-red-500" />

        <StatsCard
          title="Navigation Sessions"
          value="154"
          color="text-yellow-500"
        />
      </div>

      {/* Main Content */}

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        {/* Activity Table */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5">
          <div className="flex justify-between mb-5">
            <h2 className="text-xl font-bold">User Activity</h2>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition">
              View All
            </button>
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
                    Loading user activity...
                  </td>
                </tr>
              ) : (
                Array.isArray(users) &&
                users.slice(0, 5).map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* User */}
                    <td className="py-4 font-medium text-gray-800">
                      {user.name || user.user_name}
                    </td>

                    {/* status */}
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : user.status === "Emergency"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-700"
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
                      <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Alerts Panel */}

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-xl font-bold mb-5">Recent Alerts</h2>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="font-semibold text-red-600">SOS Triggered</p>

              <p className="text-sm text-gray-500">
                User Sarah requested emergency help
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="font-semibold text-yellow-600">Low Battery</p>

              <p className="text-sm text-gray-500">
                Device #104 battery below 10%
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="font-semibold text-blue-600">Navigation Started</p>

              <p className="text-sm text-gray-500">
                User Mike started navigation
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ActivityChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
