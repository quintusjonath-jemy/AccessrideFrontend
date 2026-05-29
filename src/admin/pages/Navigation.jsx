import axios from "axios";
import { useEffect, useState } from "react";
import LiveMap from "../components/LiveMap";
import { useLocation } from "react-router-dom";
import { MapPinned, Navigation, Car } from "lucide-react";

function NavigationPage() {
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const trackedRide = location.state?.rideId;

  const trackedDriver = location.state?.driverId;

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

  const filteredRides = trackedDriver
    ? rides.filter((ride) => ride.driver_id == trackedDriver)
    : rides;

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

      <div className="relative h-[85vh] rounded-3xl overflow-hidden shadow-2xl">
        {/* LIVE MAP */}
        <LiveMap rides={filteredRides} />

        {/* FLOATING LIVE PANEL */}
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-5 w-72 border border-gray-100">
          <h2 className="text-lg font-bold text-[#0B1929] mb-4">
            Live Navigation
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Active Rides</p>

                <h3 className="text-2xl font-bold text-green-600">
                  {filteredRides.length}
                </h3>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Navigation className="text-green-600" />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Drivers Online
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                SOS Monitoring Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavigationPage;
