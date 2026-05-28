import axios from "axios";
import { useEffect, useState } from "react";
import LiveMap from "../components/LiveMap";

import { MapPinned, Navigation, Car } from "lucide-react";

function NavigationPage() {
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);

  // FETCH RIDES
  useEffect(() => {
    const fetchRides = () => {
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
    };

    // FIRST LOAD
    fetchRides();

    // LIVE REFRESH
    const interval = setInterval(() => {
      fetchRides();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // STATUS COLORS
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",

    accepted: "bg-blue-100 text-blue-700",

    active: "bg-green-100 text-green-700",

    completed: "bg-gray-100 text-gray-700",

    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">
            Navigation Management
          </h1>

          <p className="text-gray-500 mt-1">Monitor active ride navigation</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            LIVE
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition">
            <Navigation className="w-4 h-4" />
            Live Navigation
          </button>
        </div>
      </div>

      <div className="mb-6">
        <LiveMap rides={rides} />
      </div>

      {/* RIDES TABLE */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Rider
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Pickup
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Destination
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Status
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading navigation data...
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
                    {/* USER */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {ride.user_name || "Unknown"}
                          </p>

                          <p className="text-sm text-gray-400">
                            Ride #{ride.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PICKUP */}

                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPinned className="w-4 h-4 text-green-500" />

                        {ride.pickup_location}
                      </div>
                    </td>

                    {/* DESTINATION */}

                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-red-500" />

                        {ride.dropoff_location}
                      </div>
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

                    {/* ACTION */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm transition">
                          Track Ride
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

export default NavigationPage;
