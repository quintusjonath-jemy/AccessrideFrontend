import axios from "axios";
import { useEffect, useState } from "react";
import LiveMap from "../components/LiveMap";
import { useLocation } from "react-router-dom";
import { MapPinned, Navigation, Car } from "lucide-react";

const NavigationPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const trackedRide = location.state?.rideId;
  const trackedDriver = location.state?.driverId;

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

    fetchRides();

    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredRides = trackedDriver
    ? rides.filter((ride) => ride.driver_id == trackedDriver)
    : rides;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Navigation Management
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor live ride tracking and driver movement
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">

          {/* LIVE BADGE */}
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            LIVE TRACKING
          </div>

          {/* BUTTON */}
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition">
            <Navigation className="w-4 h-4" />
            Live Navigation
          </button>

        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="relative h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-100">

        {/* MAP */}
        <LiveMap rides={filteredRides} />

        {/* LEFT FLOAT PANEL */}
        <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 w-80 border border-gray-100">

          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-blue-600" />
            Live Overview
          </h2>

          {/* ACTIVE RIDES */}
          <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
            <div>
              <p className="text-sm text-gray-500">Active Rides</p>
              <h3 className="text-2xl font-bold text-green-600">
                {filteredRides.length}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Car className="text-green-600 w-6 h-6" />
            </div>
          </div>

          {/* STATUS LIST */}
          <div className="space-y-3">

            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Drivers Online Tracking Active
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              SOS Emergency Monitoring Enabled
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Real-time GPS Updates Running
            </div>

          </div>
        </div>

        {/* BOTTOM RIGHT SMALL PANEL */}
        <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gray-100 text-sm text-gray-600">
          System Status: <span className="text-green-600 font-semibold">Healthy</span>
        </div>

      </div>
    </div>
  );
};

export default NavigationPage;