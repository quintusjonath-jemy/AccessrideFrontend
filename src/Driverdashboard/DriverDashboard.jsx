import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiMapPin, FiClock, FiDollarSign, FiUser, FiTruck } from "react-icons/fi";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : true;
  });
  const [activeRide, setActiveRide] = useState(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [recentRides, setRecentRides] = useState([]);
  const [rideRequest, setRideRequest] = useState({
    id: null,
    passengerName: "",
    pickup: "",
    dropoff: "",
    distance: "",
    duration: "",
    fare: ""
  });
  const [driverInfo, setDriverInfo] = useState({
    first_name: "Driver",
    rating: 4.8,
    total_trips: 0
  });
  const [statistics, setStatistics] = useState({
    rating: 4.8,
    total_trips: 0,
    today_earnings: 0.00,
    today_trips: 0
  });

  const fetchDashboardData = () => {
    const driverId = sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }

    fetch(`http://localhost/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { driver, statistics, active_ride, new_request, recent_rides } = res.data;
          if (driver) {
            setDriverInfo(driver);
            setIsOnline(driver.status === "online");

            // Sync current location name
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  try {
                    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
                    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`;
                    const geoRes = await fetch(geocodeUrl);
                    const geoData = await geoRes.json();
                    
                    let address = null;
                    if (geoData.features && geoData.features.length > 0) {
                      address = geoData.features[0].place_name;
                    }

                    if (!address) {
                      address = driver.town || driver.district || "Colombo";
                    }

                    // Update DB with GPS location name
                    await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        driver_id: driverId,
                        location: address,
                        latitude: latitude,
                        longitude: longitude
                      })
                    });
                  } catch (err) {
                    console.error("Error geocoding or updating location:", err);
                    try {
                      await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          driver_id: driverId,
                          location: driver.town || driver.district || "Colombo",
                          latitude: latitude,
                          longitude: longitude
                        })
                      });
                    } catch (fallbackErr) {
                      console.error("Error setting fallback location:", fallbackErr);
                    }
                  }
                },
                async (error) => {
                  console.error("GPS blocked/failed, falling back to registered town:", error);
                  try {
                    await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        driver_id: driverId,
                        location: driver.town || driver.district || "Colombo",
                        latitude: 6.9271,
                        longitude: 79.8612
                      })
                    });
                  } catch (err) {
                    console.error("Error setting fallback location:", err);
                  }
                }
              );
            }
          }
          if (statistics) {
            setStatistics(statistics);
          }
          if (active_ride) {
            setActiveRide({
              pickup: active_ride.pickup,
              dropoff: active_ride.dropoff,
              fare: "Rs. " + parseFloat(active_ride.fare).toFixed(2)
            });
          } else {
            setActiveRide(null);
          }
          if (recent_rides) {
            setRecentRides(recent_rides);
          }
          if (new_request) {
            setRideRequest({
              id: new_request.id,
              passengerName: new_request.passenger_name || "Passenger",
              pickup: new_request.pickup,
              dropoff: new_request.dropoff,
              distance: new_request.distance + " km",
              duration: "10 mins",
              fare: "Rs. " + parseFloat(new_request.fare).toFixed(2)
            });
            setShowRequestPopup(true);
          } else {
            setShowRequestPopup(false);
          }
        }
      })
      .catch(() => {
        // ignore fetch errors
      });
  };

  useEffect(() => {
    fetchDashboardData();

    // Poll every 4 seconds to check for new request card overlays
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("driverOnlineStatus", JSON.stringify(isOnline));
  }, [isOnline]);

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    const driverId = sessionStorage.getItem("driver_id");
    if (driverId) {
      fetch("http://localhost/Driverdashboard/api/update_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driverId,
          status: newStatus ? "online" : "offline"
        })
      }).catch((err) => console.error("Error updating online status:", err));
    }
  };

  const acceptRide = () => {
    const driverId = sessionStorage.getItem("driver_id") || 1;
    fetch("http://localhost/Driverdashboard/api/accept.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        driver_id: driverId,
        ride_id: rideRequest.id
      })
    })
      .then(() => {
        setShowRequestPopup(false);
        navigate("/ride");
      })
      .catch((err) => console.error("Error accepting ride:", err));
  };

  const rejectRide = () => {
    const driverId = sessionStorage.getItem("driver_id") || 1;
    fetch("http://localhost/Driverdashboard/api/reject.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        driver_id: driverId,
        ride_id: rideRequest.id
      })
    })
      .then(() => {
        setShowRequestPopup(false);
        fetchDashboardData();
      })
      .catch((err) => console.error("Error rejecting ride:", err));
  };

  return (
    <>
      <div className="border-b border-slate-200 px-5 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#00236F]">🚕 AccessRide</h1>
            <p className="text-sm text-slate-500 font-medium">Driver Dashboard</p>
          </div>
          <img 
            src={driverInfo.profile_image ? `http://localhost/admin/uploads/${driverInfo.profile_image}` : "/src/Driverdashboard/drivering.webp"} 
            alt="Driver avatar" 
            className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-100" 
            onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
          />
        </div>
      </div>

      <div className="bg-slate-50 px-5 py-5">
        <div className="flex items-start justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm font-bold text-slate-900">Good Morning, {driverInfo.first_name}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">⭐ {statistics.rating}</span>
              <span className="font-medium">{statistics.total_trips} Trips</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Today's Earnings</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-600">Rs. {Number(statistics.today_earnings).toFixed(2)}</p>
            <p className="text-xs text-slate-500 font-medium">{statistics.today_trips} Completed</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <span className={`h-3.5 w-3.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
              <p className="text-sm font-bold">Status: {isOnline ? "Online" : "Offline"}</p>
            </div>
            <button
              onClick={toggleStatus}
              className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`}
            >
              <span className={`inline-block h-7 w-7 rounded-full bg-white shadow transition-transform ${isOnline ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {activeRide && (
          <div className="rounded-[2rem] bg-blue-50/80 p-5 shadow-sm ring-1 ring-blue-200 cursor-pointer hover:bg-blue-100 transition duration-300" onClick={() => navigate("/ride")}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-blue-900 tracking-wider uppercase">ONGOING RIDE</p>
              <p className="text-base font-extrabold text-blue-900">{activeRide.fare}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-blue-800">
              <div>
                <p className="text-blue-500 font-bold text-[10px] tracking-wider uppercase mb-1">Pickup</p>
                <p className="font-semibold text-blue-900 truncate">{activeRide.pickup}</p>
              </div>
              <div>
                <p className="text-blue-500 font-bold text-[10px] tracking-wider uppercase mb-1">Dropoff</p>
                <p className="font-semibold text-blue-900 truncate">{activeRide.dropoff}</p>
              </div>
            </div>
            <div className="mt-4 text-center text-xs font-bold text-blue-600 bg-blue-100/50 py-2 rounded-xl">
              Tap to view details &rarr;
            </div>
          </div>
        )}

        {/* MONTHLY EARNINGS & SUBSCRIPTION INFO CARD */}
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase">Earnings & Subscription</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Month</p>
              <p className="mt-1 text-lg font-extrabold text-[#00236F]">Rs. {Number(statistics.current_month_earnings || 0).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previous Month</p>
              <p className="mt-1 text-lg font-extrabold text-slate-700">Rs. {Number(statistics.prev_month_earnings || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Subscription Expiry</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{statistics.subscription_expires_at || "No Active Plan"}</p>
            </div>
            <span className="text-xl">📅</span>
          </div>
        </div>

        {/* RECENT RIDES SECTION */}
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase">Recent Rides</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Last 5 Trips</span>
          </div>
          <div className="mt-4 space-y-4">
            {recentRides.length === 0 ? (
              <div className="text-center py-8">
                <FiTruck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No recent rides found.</p>
              </div>
            ) : (
              recentRides.map((ride) => (
                <div key={ride.id} className="flex justify-between items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition hover:bg-slate-100/50">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm truncate">{ride.passenger_name || "Passenger"}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                        ride.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 pt-1">
                      <span className="text-emerald-500 text-[10px]">●</span> {ride.pickup_location}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                      <span className="text-rose-500 text-[10px]">●</span> {ride.dropoff_location}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium pt-1">{ride.ride_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">Rs. {parseFloat(ride.fare).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* INCOMING REQUEST MODAL POPUP */}
      {showRequestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-5 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm rounded-[2.2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-100 space-y-4 transform scale-100 transition-transform duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Incoming Ride</h2>
              <span className="text-base font-extrabold text-blue-900">{rideRequest.fare}</span>
            </div>

            <div className="space-y-3 py-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Passenger</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{rideRequest.passengerName}</p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pickup</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{rideRequest.pickup}</p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Dropoff</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{rideRequest.dropoff}</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 pt-1">
                <span>📍 {rideRequest.distance}</span>
                <span>⏱ {rideRequest.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={rejectRide}
                className="rounded-2xl border border-rose-500 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
              >
                REJECT
              </button>
              <button
                onClick={acceptRide}
                className="rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white transition hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
              >
                ACCEPT RIDE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DriverDashboard;
