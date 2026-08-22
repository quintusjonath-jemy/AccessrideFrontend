import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import API_BASE from "../config/api";

const COLOMBO_LNG = 79.8612;
const COLOMBO_LAT = 6.9271;

const RidePage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [rideInfo, setRideInfo] = useState({
    id: null,
    passengerName: "Passenger",
    passengerPhone: "",
    passengerRating: 4.8,
    pickup: "Loading pickup...",
    dropoff: "Loading dropoff...",
    distance: 0.0,
    eta: 10,
    fare: 0.00,
    passengers: 1,
    status: "Accepted",
    startedAt: "Now",
    driverLat: COLOMBO_LAT,
    driverLng: COLOMBO_LNG
  });

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Payment Confirmation Modal state
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  useEffect(() => {
    const driverId = sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }

    fetch(`${API_BASE}/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then(async (res) => {
        if (res.success && res.data && res.data.active_ride) {
          const ride = res.data.active_ride;
          const lat = parseFloat(ride.driver_lat) || COLOMBO_LAT;
          const lng = parseFloat(ride.driver_lng) || COLOMBO_LNG;

          setRideInfo({
            id: ride.id,
            passengerName: ride.passenger_name || "Passenger",
            passengerPhone: ride.passenger_phone || "",
            passengerRating: 4.8,
            pickup: ride.pickup,
            dropoff: ride.dropoff,
            distance: parseFloat(ride.distance) || 0.0,
            eta: Math.round(parseFloat(ride.distance) * 3) || 10,
            fare: parseFloat(ride.fare) || 0.00,
            passengers: 1,
            status: ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : "Accepted",
            startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            driverLat: lat,
            driverLng: lng
          });
          setLoading(false);
        } else {
          window.alert("No active ride found.");
          navigate("/driver-dashboard");
        }
      })
      .catch((err) => {
        console.error("Error loading active ride:", err);
        setLoading(false);
      });
  }, [navigate]);

  // Initialize map after ride data loads
  useEffect(() => {
    if (loading || !mapContainer.current || mapRef.current || !rideInfo.id) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = mapboxToken;

    const initializeMap = async () => {
      // Get driver's live position FIRST — we'll use it as the geocoding
      // proximity anchor so that ambiguous place names (e.g. "Udawela" exists
      // near Colombo AND near Badulla) resolve to the correct local place.
      const getLiveDriverPosition = () =>
        new Promise((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
              () => {
                const dbLat = rideInfo.driverLat;
                const dbLng = rideInfo.driverLng;
                const inSriLanka = dbLat >= 5.9 && dbLat <= 9.9 && dbLng >= 79.5 && dbLng <= 81.9;
                resolve(inSriLanka ? [dbLng, dbLat] : [COLOMBO_LNG, COLOMBO_LAT]);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
            );
          } else {
            const dbLat = rideInfo.driverLat;
            const dbLng = rideInfo.driverLng;
            const inSriLanka = dbLat >= 5.9 && dbLat <= 9.9 && dbLng >= 79.5 && dbLng <= 81.9;
            resolve(inSriLanka ? [dbLng, dbLat] : [COLOMBO_LNG, COLOMBO_LAT]);
          }
        });

      // Resolve driver's GPS position first
      const driverPosition = await getLiveDriverPosition();
      const [drvLng, drvLat] = driverPosition;

      // Geocode a place name restricted to Sri Lanka, biased toward the driver's
      // actual location so local place names resolve correctly (not the same name
      // in another part of Sri Lanka).
      const geocode = async (query) => {
        if (!query) return null;
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=lk&proximity=${drvLng},${drvLat}&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            return data.features[0].geometry.coordinates; // [lng, lat]
          }
        } catch (e) {
          console.error("Geocoding failed for " + query, e);
        }
        return null;
      };

      // Geocode pickup/dropoff using driver-proximity bias
      const pickupPoint = await geocode(rideInfo.pickup) || [drvLng + 0.005, drvLat + 0.005];
      const dropoffPoint = await geocode(rideInfo.dropoff) || [pickupPoint[0] + 0.01, pickupPoint[1] + 0.01];

      // Route direction: heading to pickup (accepted) or heading to dropoff (active)
      const isActive = rideInfo.status.toLowerCase() === "active";
      const startPoint = driverPosition;
      const endPoint = isActive ? dropoffPoint : pickupPoint;

      // Get shortest road route from Mapbox Directions API
      let routeGeoJSON = null;
      try {
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}.json?access_token=${mapboxToken}&geometries=geojson&alternatives=true`;
        const dirRes = await fetch(directionsUrl);
        const dirData = await dirRes.json();
        if (dirData.routes && dirData.routes.length > 0) {
          let shortest = dirData.routes[0];
          for (let i = 1; i < dirData.routes.length; i++) {
            if (dirData.routes[i].distance < shortest.distance) shortest = dirData.routes[i];
          }
          routeGeoJSON = shortest.geometry;
        }
      } catch (err) {
        console.error("Directions API call failed", err);
      }

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: driverPosition,
        zoom: 13.5,
        pitch: 45,
        bearing: -60
      });

      mapRef.current = map;

      map.on("load", () => {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: routeGeoJSON || {
              type: "LineString",
              coordinates: [startPoint, endPoint]
            }
          }
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#2563eb", "line-width": 5, "line-opacity": 0.85 }
        });

        const bounds = new mapboxgl.LngLatBounds()
          .extend(startPoint)
          .extend(endPoint);
        map.fitBounds(bounds, { padding: 60, duration: 1500, maxZoom: 15 });
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-left");

      // Pickup marker (green)
      new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat(pickupPoint)
        .setPopup(new mapboxgl.Popup().setHTML("<p style='font-size:11px;font-weight:700;padding:4px'>📍 Pickup</p>"))
        .addTo(map);

      // Dropoff marker (red)
      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(dropoffPoint)
        .setPopup(new mapboxgl.Popup().setHTML("<p style='font-size:11px;font-weight:700;padding:4px'>🏁 Drop-off</p>"))
        .addTo(map);

      // Driver marker (blue car — your current position)
      const driverEl = document.createElement("div");
      driverEl.className = "w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold";
      driverEl.innerHTML = "🚗";

      new mapboxgl.Marker(driverEl)
        .setLngLat(driverPosition)
        .setPopup(new mapboxgl.Popup().setHTML("<p style='font-size:11px;font-weight:700;padding:4px'>📡 Your Location</p>"))
        .addTo(map);
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, rideInfo]);

  const callPassenger = () => {
    if (rideInfo.passengerPhone) {
      window.open(`tel:${rideInfo.passengerPhone}`);
    } else {
      window.alert("Passenger phone number not available.");
    }
  };

  // Show OTP entry modal when driver arrives at pickup
  const handleArrived = () => {
    setOtpInput("");
    setOtpError("");
    setShowOtpModal(true);
  };

  // Verify OTP and start ride
  const confirmOtp = () => {
    const driverId = sessionStorage.getItem("driver_id");
    const enteredOtp = parseInt(otpInput, 10);
    if (!enteredOtp || otpInput.length !== 4) {
      setOtpError("Please enter the 4-digit OTP shown by the passenger.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    fetch(`${API_BASE}/Driverdashboard/api/arrive.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideInfo.id, otp: enteredOtp, driver_id: parseInt(driverId) })
    })
      .then((res) => res.json())
      .then((data) => {
        setOtpLoading(false);
        if (data.status === "success") {
          setShowOtpModal(false);
          // Update local status to Active so the map route flips to dropoff
          setRideInfo((prev) => ({ ...prev, status: "Active" }));
        } else {
          setOtpError(data.message || "Invalid OTP. Ask the passenger for the code.");
        }
      })
      .catch((err) => {
        setOtpLoading(false);
        console.error(err);
        setOtpError("Network error. Please try again.");
      });
  };

  const completeRide = () => {
    if (!rideInfo.id) return;
    fetch(`${API_BASE}/Driverdashboard/api/complete.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideInfo.id })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          window.alert("Ride completed successfully.");
          navigate("/driver-dashboard");
        } else {
          window.alert("Failed to complete the ride.");
        }
      })
      .catch((err) => {
        console.error(err);
        window.alert("Error completing the ride.");
      });
  };

  const cancelRide = () => {
    if (!rideInfo.id) return;
    fetch(`${API_BASE}/Driverdashboard/api/cancel.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideInfo.id })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          window.alert("Ride canceled successfully.");
          navigate("/driver-dashboard");
        } else {
          window.alert("Failed to cancel the ride.");
        }
      })
      .catch((err) => {
        console.error(err);
        window.alert("Error canceling the ride.");
      });
  };

  const isActive = rideInfo.status.toLowerCase() === "active";

  if (loading) {
    return (
      <div className="bg-slate-50 flex items-center justify-center min-h-[100dvh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading ride details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 flex justify-center pb-24 md:py-10 min-h-[100dvh]">
      <div className="w-full max-w-[430px] md:max-w-2xl lg:max-w-[430px] bg-white md:shadow-2xl md:rounded-[2.5rem] md:border border-slate-200 flex flex-col min-h-[100dvh] md:min-h-fit overflow-hidden relative transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
          <button onClick={() => navigate('/driver-dashboard')} className="text-xl md:text-2xl text-slate-700 hover:text-slate-900 transition">←</button>
          <h1 className="font-bold text-lg md:text-xl text-[#00236F]">
            {isActive ? "Ride Active — En Route" : "Heading to Pickup"}
          </h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-4 space-y-5 md:space-y-6 lg:space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-10">

          {/* Map */}
          <div className="relative bg-gray-300 rounded-2xl h-52 md:h-72 lg:h-52 overflow-hidden shadow-inner">
            <div ref={mapContainer} className="w-full h-full rounded-2xl" />
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
              {isActive ? `${rideInfo.distance} km to Drop-off` : "Navigating to Pickup"}
            </div>
          </div>

          {/* Passenger Info */}
          <div className="bg-gray-50 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 text-lg font-bold">
                  {rideInfo.passengerName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold">{rideInfo.passengerName}</h2>
                  <p className="text-sm text-gray-500">⭐ {rideInfo.passengerRating}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full font-bold text-lg" onClick={callPassenger} title="Call Passenger">📞</button>
                <button className="bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-full">💬</button>
              </div>
            </div>

            <hr />

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium text-sm">{rideInfo.pickup}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Drop-off</p>
                <p className="font-medium text-sm">{rideInfo.dropoff}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Dist.</p>
              <p className="font-bold">{rideInfo.distance}</p>
              <p className="text-xs text-gray-400">km</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-bold">{rideInfo.eta}</p>
              <p className="text-xs text-gray-400">min</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Fare</p>
              <p className="font-bold">{rideInfo.fare.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Rs.</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Pass.</p>
              <p className="font-bold">{rideInfo.passengers}</p>
              <p className="text-xs text-gray-400">user</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-bold text-blue-900">Accepted</span>
              <span className={isActive ? "font-bold text-blue-900" : "text-gray-400"}>Arrived</span>
              <span className={isActive ? "font-bold text-yellow-600" : "text-gray-400"}>Active</span>
              <span className="text-gray-400">Completed</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-6 h-6 bg-blue-900 rounded-full" />
              <div className={`flex-1 h-1 ${isActive ? "bg-blue-900" : "bg-gray-300"}`} />
              <div className={`w-6 h-6 rounded-full ${isActive ? "bg-blue-900" : "bg-gray-300"}`} />
              <div className={`flex-1 h-1 ${isActive ? "bg-yellow-400" : "bg-gray-300"}`} />
              <div className={`w-6 h-6 rounded-full border-4 border-white ${isActive ? "bg-yellow-400 animate-pulse" : "bg-gray-300"}`} />
              <div className="flex-1 h-1 bg-gray-300" />
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>
            <p className="text-sm mt-3 text-gray-600">
              {isActive ? `Ride started at ${rideInfo.startedAt}` : "En route to passenger pickup"}
            </p>
          </div>

          {/* Action Buttons */}
          {!isActive && (
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              onClick={handleArrived}
            >
              <span>📍</span> ARRIVED AT PICKUP — Enter OTP
            </button>
          )}

          {isActive && (
            <button
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition"
              onClick={() => setShowPaymentConfirm(true)}
            >
              ✅ COMPLETE RIDE
            </button>
          )}

          <button
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
            onClick={cancelRide}
          >
            CANCEL RIDE
          </button>
        </div>
      </div>

      {/* OTP Entry Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl space-y-5">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Verify Passenger OTP</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ask the passenger for the 4-digit code shown on their screen.
              </p>
            </div>

            {/* OTP Input */}
            <input
              type="number"
              maxLength={4}
              value={otpInput}
              onChange={(e) => { setOtpInput(e.target.value.slice(0, 4)); setOtpError(""); }}
              placeholder="_ _ _ _"
              className="w-full text-center text-3xl font-black tracking-[0.5em] border-2 border-slate-200 focus:border-emerald-500 rounded-2xl py-4 outline-none text-[#0B2F89] transition"
              autoFocus
            />

            {otpError && (
              <p className="text-xs text-red-600 font-semibold text-center bg-red-50 py-2 px-3 rounded-xl">
                ❌ {otpError}
              </p>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowOtpModal(false)}
                className="rounded-2xl border border-slate-300 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmOtp}
                disabled={otpLoading || otpInput.length !== 4}
                className="rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {otpLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                ) : "Confirm & Start"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl animate-bounce">
                💵
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Collect Ride Payment</h2>
              <p className="text-xs text-slate-500 mt-1">
                Please collect the payment from the passenger.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center space-y-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount to Collect</span>
              <p className="text-4xl font-black text-[#00236F]">
                Rs. {rideInfo.fare.toFixed(2)}
              </p>
              <span className="inline-block px-3 py-1 bg-blue-100/50 border border-blue-200 text-[#00236F] text-[10px] font-bold rounded-lg uppercase tracking-wide mt-1">
                Payment Type: Cash
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPaymentConfirm(false)}
                className="rounded-2xl border border-slate-300 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setShowPaymentConfirm(false);
                  completeRide();
                }}
                className="rounded-2xl bg-[#00236F] hover:bg-blue-800 py-3 text-sm font-bold text-white transition shadow-md"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RidePage;
