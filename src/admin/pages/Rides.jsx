import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Car, Eye, Trash2, Plus } from "lucide-react";

function Rides() {
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // FETCH RIDES
  useEffect(() => {
    axios
      .get("http://localhost/admin/api/rides.php")

      .then((res) => {
        setRides(Array.isArray(res.data) ? res.data : []);

        setLoading(false);
      })

      .catch((err) => {
        console.log(err);

        setLoading(false);
      });
  }, []);

  // STATUS COLORS
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",

    active: "bg-green-100 text-green-700",

    completed: "bg-blue-100 text-blue-700",

    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">Ride Management</h1>

          <p className="text-gray-500 mt-1">
            Manage active and completed rides
          </p>
        </div>

        <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold transition">
          <Plus className="w-4 h-4" />
          Add Ride
        </button>
      </div>

      {/* RIDES TABLE */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Ride
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Driver
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Location
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Fare
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Distance
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Ride Date
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading rides...
                  </div>
                </td>
              </tr>
            ) : (
              rides.map((ride) => {
                const rideStatus = (ride.status || "").toLowerCase().trim();

                return (
                  <tr
                    key={ride.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* RIDE */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-yellow-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            Ride #{ride.id}
                          </p>

                          <p className="text-sm text-gray-400">
                            User: {ride.user_name || "Unknown User"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DRIVER */}

                    <td className="px-6 py-4 text-gray-600">
                      {ride.driver_name || "Unknown Driver"}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[rideStatus] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>

                    {/* LOCATION */}

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

                    <td className="px-6 py-4 text-gray-600 font-medium">
                      Rs. {ride.fare}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {ride.distance_km} km
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {ride.ride_date}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate("/navigation", {
                              state: {
                                rideId: ride.id,
                                driverId: ride.driver_id,
                              },
                            })
                          }
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm transition"
                        >
                          Track
                        </button>

                        <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Eye className="w-4 h-4" />
                        </button>

                        <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Rides;
