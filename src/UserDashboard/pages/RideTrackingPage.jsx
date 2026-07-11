import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, ShieldAlert, Navigation, Car, Star } from "lucide-react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// Sri Lanka proximity bias center (Colombo)
const COLOMBO_LNG = 79.8612;
const COLOMBO_LAT = 6.9271;

// Geocode a location text to [longitude, latitude] — restricted to Sri Lanka.
// Pass optional proximity [lng, lat] to bias results toward a specific area
// (e.g. driver location) so ambiguous place names resolve to the correct local place.
const geocodeLocation = async (query, proximity = null) => {
  if (!query) return null;

  // Use provided proximity, or fall back to Colombo as a general Sri Lanka center
  const [proxLng, proxLat] = proximity || [COLOMBO_LNG, COLOMBO_LAT];

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=lk&proximity=${proxLng},${proxLat}&limit=1`;
    const res = await axios.get(url);
    if (res.data?.features && res.data.features.length > 0) {
      return res.data.features[0].geometry.coordinates; // [lng, lat]
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
};

// Calculate Haversine distance in km between two [lng, lat] coordinates
const calculateHaversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return 0;
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RideTrackingPage = () => {
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapbox Refs/State
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const mapInitRef = useRef(false);

  // Map Coordinates State
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [displayDistance, setDisplayDistance] = useState(null);
  const [userLiveCoords, setUserLiveCoords] = useState(null);

  // Keep a ref of the ride state to prevent closure issue inside the polling interval
  const rideRef = useRef(null);
  useEffect(() => {
    rideRef.current = ride;
  }, [ride]);

  const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

  // Function to fetch the active ride from backend
  const fetchActiveRide = async (isFirstLoad = false) => {
    try {
      const res = await axios.get(`http://localhost/UserDashboard/api/active_ride.php?user_id=${userId}`);
      if (res.data.success && res.data.data) {
        const rideData = res.data.data;
        setRide(rideData);

        // Resolve driver coordinates FIRST so we can use them as the geocoding
        // proximity anchor — this ensures pickup/dropoff names like "Udawela"
        // resolve to the correct place near the ride, not a different place of
        // the same name near Colombo.
        let drvCoords = null;
        if (rideData.driver_lat && rideData.driver_lng) {
          const dlat = parseFloat(rideData.driver_lat);
          const dlng = parseFloat(rideData.driver_lng);
          const inSriLanka = dlat >= 5.9 && dlat <= 9.9 && dlng >= 79.5 && dlng <= 81.9;
          if (inSriLanka) {
            drvCoords = [dlng, dlat];
          }
        }
        setDriverCoords(drvCoords);

        // Use driver coords (or user's live GPS) as proximity for geocoding
        const proximityAnchor = drvCoords || userLiveCoords || null;

        // Geocode pickup/dropoff biased toward the ride location
        const pCoords = await geocodeLocation(rideData.pickup_location, proximityAnchor);
        const dCoords = await geocodeLocation(rideData.dropoff_location, proximityAnchor);
        setPickupCoords(pCoords);
        setDropoffCoords(dCoords);

        // Fallback driver offset if no valid coords
        const resolvedDrvCoords = drvCoords || (pCoords ? [pCoords[0] - 0.005, pCoords[1] + 0.003] : null);
        if (!drvCoords && resolvedDrvCoords) setDriverCoords(resolvedDrvCoords);

        // Determine route endpoints based on ride status
        let startPoint = null;
        let endPoint = null;

        if (rideData.status === "pending" || rideData.status === "accepted") {
          // Driver heading to user: driver → user's live GPS (or pickup as fallback)
          startPoint = resolvedDrvCoords;
          endPoint = userLiveCoords || pCoords;
        } else {
          // Ride in progress (active): driver/car → dropoff destination
          startPoint = resolvedDrvCoords;
          endPoint = dCoords;
        }

        // Fetch route geometry and distance between startPoint and endPoint
        if (startPoint && endPoint) {
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}.json?access_token=${MAPBOX_TOKEN}&geometries=geojson&alternatives=true`;
          const routeRes = await axios.get(url);
          if (routeRes.data?.routes && routeRes.data.routes.length > 0) {
            let shortestRoute = routeRes.data.routes[0];
            for (let i = 1; i < routeRes.data.routes.length; i++) {
              if (routeRes.data.routes[i].distance < shortestRoute.distance) {
                shortestRoute = routeRes.data.routes[i];
              }
            }
            setRouteGeoJSON(shortestRoute.geometry);
            if (rideData.status === "active") {
              setDisplayDistance(shortestRoute.distance / 1000); // convert meters to km
            }
          } else {
            // Fallback
            if (rideData.status === "active") {
              setDisplayDistance(rideData.distance_km);
            }
            setRouteGeoJSON(null);
          }
        } else {
          if (rideData.status === "active") {
            setDisplayDistance(rideData.distance_km);
          }
          setRouteGeoJSON(null);
        }
      } else {
        // If there was an active ride in progress and now it is null (i.e. completed),
        // redirect the passenger to the complete-ride page so they can pay/rate.
        if (!isFirstLoad && rideRef.current && (rideRef.current.status === "active" || rideRef.current.status === "accepted")) {
          navigate("/complete-ride");
        } else {
          setRide(null);
        }
      }
    } catch (err) {
      console.error("Error fetching active ride:", err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this ride?");
    if (!confirmCancel) return;

    try {
      const res = await axios.post("http://localhost/UserDashboard/api/cancel_ride.php", {
        ride_id: ride.id
      });
      if (res.data.success) {
        alert("Ride cancelled and deleted successfully.");
        navigate("/user/dashboard");
      } else {
        alert(res.data.message || "Failed to cancel ride.");
      }
    } catch (err) {
      console.error("Error cancelling ride:", err);
      alert("An error occurred while cancelling the ride.");
    }
  };

  // Watch user's live device location
  useEffect(() => {
    if (navigator.geolocation) {
      const geoId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLiveCoords([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error watching live location:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(geoId);
    }
  }, []);

  // Calculate live user-to-driver straight-line distance reactively using Haversine
  useEffect(() => {
    if (ride && (ride.status === "pending" || ride.status === "accepted") && driverCoords) {
      const targetUserCoords = userLiveCoords || pickupCoords;
      if (targetUserCoords) {
        const calculatedDist = calculateHaversineDistance(driverCoords, targetUserCoords);
        setDisplayDistance(calculatedDist);
      }
    }
  }, [userLiveCoords, driverCoords, ride?.status, pickupCoords]);

  // Initial Load and Polling Interval (Every 8 seconds)
  useEffect(() => {
    fetchActiveRide(true);
    const interval = setInterval(() => {
      fetchActiveRide(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Mapbox Map when the ride is loaded and map container is in the DOM
  useEffect(() => {
    if (loading || !ride || !mapContainerRef.current || mapInitRef.current) return;

    mapInitRef.current = true;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [79.8612, 6.9271], // Colombo center
      zoom: 13,
      pitch: 30
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMap(null);
        mapInitRef.current = false;
        pickupMarkerRef.current = null;
        dropoffMarkerRef.current = null;
        driverMarkerRef.current = null;
      }
    };
  }, [loading, ride?.id]);

  // Update Markers and Route Layout on Map
  useEffect(() => {
    if (!map) return;

    const drawMapLayers = () => {
      // Clean up existing markers
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();
      if (driverMarkerRef.current) driverMarkerRef.current.remove();
      if (userMarkerRef.current) userMarkerRef.current.remove();

      // User live location marker (blue pulsing)
      if (userLiveCoords) {
        const userEl = document.createElement("div");
        userEl.className = "w-10 h-10 bg-[#0B2F89] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-base animate-pulse";
        userEl.innerHTML = "🧑";
        userMarkerRef.current = new mapboxgl.Marker(userEl)
          .setLngLat(userLiveCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p class='font-bold text-xs p-1'>📍 You</p>"))
          .addTo(map);
      }

      // Add Pickup Marker (Green)
      if (pickupCoords) {
        pickupMarkerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat(pickupCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p class='font-bold text-xs p-1'>Pickup Point</p>"))
          .addTo(map);
      }

      // Add Drop-off Marker (Red)
      if (dropoffCoords) {
        dropoffMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat(dropoffCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p class='font-bold text-xs p-1'>Dropoff Destination</p>"))
          .addTo(map);
      }

      // Add Driver Marker (Pulsing blue element matching vehicle type)
      if (driverCoords) {
        const el = document.createElement("div");
        el.className = "w-10 h-10 bg-[#0B2F89] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-base animate-pulse cursor-pointer";
        
        const getVehicleEmoji = (pickupLocation, driverType, vehicleType) => {
          let type = null;
          if (vehicleType) {
            type = vehicleType.trim().toLowerCase();
          }
          if (!type && pickupLocation) {
            const match = pickupLocation.match(/\(Vehicle:\s*([^\)]+)\)/i);
            if (match) {
              type = match[1].trim().toLowerCase();
            }
          }
          if (!type) {
            type = (driverType || "car").toLowerCase().trim();
          }
          if (type.includes("bike") || type.includes("motorcycle")) return "🏍️";
          if (type.includes("van") || type.includes("suv")) return "🚐";
          if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) return "🛺";
          return "🚗";
        };
        
        el.innerHTML = getVehicleEmoji(ride?.pickup_location, ride?.driver_vehicle_type, ride?.vehicle_type);

        const popupText = (ride?.status === "pending" || ride?.status === "accepted") && displayDistance !== null
          ? `Your Driver (${displayDistance.toFixed(1)} km away)`
          : "Your Driver";

        driverMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat(driverCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p class='font-bold text-xs p-1'>${popupText}</p>`))
          .addTo(map);
      }

      // Fit bounds to show driver and user (or driver+dropoff if ride active)
      const bounds = new mapboxgl.LngLatBounds();
      let hasCoords = false;
      if (ride?.status === "pending" || ride?.status === "accepted") {
        if (driverCoords) { bounds.extend(driverCoords); hasCoords = true; }
        const userTarget = userLiveCoords || pickupCoords;
        if (userTarget) { bounds.extend(userTarget); hasCoords = true; }
      } else {
        if (driverCoords) { bounds.extend(driverCoords); hasCoords = true; }
        if (dropoffCoords) { bounds.extend(dropoffCoords); hasCoords = true; }
      }

      if (hasCoords) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1200 });
      }

      // Render Route overlay
      if (routeGeoJSON) {
        if (map.getSource("route")) {
          map.getSource("route").setData({
            type: "Feature",
            geometry: routeGeoJSON
          });
        } else {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: routeGeoJSON
            }
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 5,
              "line-opacity": 0.8
            }
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      drawMapLayers();
    } else {
      map.once("load", drawMapLayers);
    }
  }, [map, pickupCoords, dropoffCoords, driverCoords, routeGeoJSON, ride?.status, displayDistance, userLiveCoords]);

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#0B2F89] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#0B2F89]">Fetching active ride info...</p>
      </div>
    );
  }

  // Empty state if no active ride
  if (!ride) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 flex flex-col justify-center items-center text-center">
        <div className="h-20 w-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-5 border border-slate-200">
          <Car size={36} />
        </div>
        <h2 className="text-lg font-bold text-[#0B2F89]">No Active Ride</h2>
        <p className="text-gray-400 text-xs mt-2 max-w-[240px] leading-relaxed">
          You don't have an active ride in progress. You can book an immediate ride or manage your scheduled trips.
        </p>
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => navigate("/user/booking")}
            className="flex-1 py-3.5 bg-[#FEC329] hover:bg-yellow-500 font-bold text-xs rounded-2xl shadow text-slate-900 transition cursor-pointer"
          >
            Book a Ride
          </button>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-2xl text-[#0B2F89] transition cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Map Layout */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Searching Overlay */}
      {ride.driver_status === "pending" && (
        <div className="absolute inset-0 z-30 bg-slate-900/90 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center">
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/10 border border-blue-500/20 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-blue-500/20 border border-blue-500/35 animate-pulse" />
            <div className="absolute inset-10 rounded-full bg-blue-500/30 border border-blue-500/50 animate-ping [animation-delay:0.5s]" />
            <div className="relative w-20 h-20 bg-gradient-to-tr from-[#0B2F89] to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
              <Car size={32} className="text-white animate-bounce" />
            </div>
            <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight animate-pulse">
            Finding Your Driver
          </h2>
          <p className="text-slate-350 text-sm max-w-[280px] mt-2 leading-relaxed">
            Searching for a nearby <span className="text-[#FEC329] font-bold capitalize">{ride.vehicle_type || "driver"}</span>...
          </p>

          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2 text-left">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ride Details</div>
            <div className="text-xs text-slate-200 truncate">
              <span className="font-bold text-[#FEC329]">📍 Pickup:</span> {ride.pickup_location}
            </div>
            <div className="text-xs text-slate-200 truncate">
              <span className="font-bold text-blue-400">🏁 Dropoff:</span> {ride.dropoff_location}
            </div>
            <div className="text-xs text-slate-200">
              <span className="font-bold text-emerald-400">💰 Est. Fare:</span> Rs. {parseFloat(ride.fare).toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleCancelRide}
            className="mt-10 px-8 py-3 bg-red-600/25 hover:bg-red-650 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white font-bold text-xs rounded-2xl shadow transition duration-200 cursor-pointer flex items-center gap-1.5"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Header Back Link */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="flex items-center justify-center p-3 bg-white hover:bg-slate-50 rounded-full shadow-lg border border-slate-100 text-[#0B2F89] transition cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="w-full z-10 mt-auto px-4 pb-6 space-y-4">
        {/* Float Status Ribbon */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ride Status</span>
            <h3 className="font-extrabold text-[#0B2F89] text-sm mt-0.5 capitalize flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping inline-block" />
              {ride.status === "pending" && `Locating your driver... ${displayDistance !== null ? `(${displayDistance.toFixed(1)} km away)` : ""}`}
              {ride.status === "accepted" && `Driver is arriving... ${displayDistance !== null ? `(${displayDistance.toFixed(1)} km away)` : ""}`}
              {ride.status === "active" && "On the way..."}
              {ride.status === "scheduled" && "Ride scheduled"}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {ride.status === "pending" || ride.status === "accepted" ? "Driver Distance" : "Remaining Dist."}
            </span>
            <p className="text-slate-800 font-black text-sm mt-0.5">
              {displayDistance !== null ? `${displayDistance.toFixed(1)} km` : (ride.distance_km ? `${ride.distance_km.toFixed(1)} km` : "--")}
            </p>
          </div>
        </div>

        {/* Driver Profile Card */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-[#0B2F89]/5 text-[#0B2F89] border border-[#0B2F89]/10 rounded-full flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                {ride.driver_name ? ride.driver_name.charAt(0) : "D"}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0B2F89]">
                  {ride.driver_name || "Driver Assigned"}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="fill-amber-400 stroke-amber-400" />
                  <span className="text-xs font-bold text-slate-700">4.9</span>
                  <span className="text-slate-400 text-[10px]">• Professional Driver</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            {ride.driver_phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${ride.driver_phone}`}
                  className="p-3 bg-slate-50 hover:bg-[#0B2F89]/5 border border-slate-100 rounded-full text-[#0B2F89] transition shadow-sm"
                  title="Call Driver"
                >
                  <Phone size={16} />
                </a>
                <button
                  onClick={() => alert("Message feature coming soon!")}
                  className="p-3 bg-slate-50 hover:bg-[#0B2F89]/5 border border-slate-100 rounded-full text-[#0B2F89] transition shadow-sm"
                  title="Message Driver"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          {ride.driver_vehicle_number && (
            <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-100/30 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold capitalize">
                <span className="text-base">
                  {(() => {
                    const type = (ride.driver_vehicle_type || "car").toLowerCase();
                    if (type.includes("bike") || type.includes("motorcycle")) return "🏍️";
                    if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) return "🛺";
                    if (type.includes("van") || type.includes("suv")) return "🚐";
                    return "🚗";
                  })()}
                </span>
                <span>{ride.driver_vehicle_type || "Standard Vehicle"}</span>
              </div>
              <span className="px-3 py-1 bg-white border border-blue-100 rounded-lg text-slate-800 font-black shadow-sm tracking-wide uppercase">
                {ride.driver_vehicle_number}
              </span>
            </div>
          )}

          {/* Trip Details (From / To) */}
          <div className="space-y-2 text-xs border-t border-slate-50 pt-4">
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5 flex-wrap">
                Pickup: 
                <strong className="text-slate-700 font-bold ml-1">
                  {ride.pickup_location ? ride.pickup_location.replace(/\s*\(Vehicle:\s*[^\)]+\)/i, "") : ""}
                </strong>
                {(() => {
                  let vehicleType = ride.vehicle_type;
                  if (!vehicleType) {
                    const match = ride.pickup_location?.match(/\(Vehicle:\s*([^\)]+)\)/i);
                    if (match) {
                      vehicleType = match[1];
                    }
                  }
                  if (vehicleType) {
                    const type = vehicleType.trim().toLowerCase();
                    let emoji = "🚗";
                    if (type.includes("bike") || type.includes("motorcycle")) emoji = "🏍️";
                    else if (type.includes("van") || type.includes("suv")) emoji = "🚐";
                    else if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) emoji = "🛺";
                    return (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold gap-1 border border-blue-100">
                        {emoji} {vehicleType}
                      </span>
                    );
                  }
                  return null;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Drop-off: <strong className="text-slate-800 font-black ml-1">{ride.dropoff_location}</strong></span>
            </div>
            <div className="flex justify-between items-center text-gray-400 border-t border-slate-50/50 pt-3">
              <span>Payment Mode: <strong className="text-slate-800 font-bold ml-1 uppercase">{ride.payment_method || "cash"}</strong></span>
              <span className="text-sm font-black text-[#0B2F89]">
                Rs. {ride.fare ? ride.fare.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          {/* Action Row: SOS trigger, Cancel & Back */}
          <div className="flex flex-col gap-3 border-t border-slate-50 pt-4">
            {ride && (ride.status === "pending" || ride.status === "accepted") && (
              <div className="bg-gradient-to-br from-[#0B2F89]/5 to-blue-50 border-2 border-[#0B2F89]/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  <div>
                    <span className="text-[11px] text-[#0B2F89] font-extrabold uppercase tracking-wider">Your OTP — Share with Driver</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">When your driver arrives, show them this code to start the ride.</p>
                  </div>
                </div>
                <div className="bg-white border border-[#0B2F89]/15 rounded-2xl py-4 shadow-sm text-center">
                  <span className="text-4xl font-black text-[#0B2F89] tracking-[0.4em] font-mono">
                    {((ride.id * 127 + 3571) % 9000 + 1000)}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Valid for this trip only</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              {ride.status !== "active" ? (
                <>
                  <button
                    onClick={() => navigate("/user/sos")}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-[#d32f2f] text-white font-bold text-xs rounded-2xl shadow flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShieldAlert size={16} />
                    <span>Trigger SOS Alert</span>
                  </button>
                  <button
                    onClick={handleCancelRide}
                    className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-2xl transition cursor-pointer text-center"
                  >
                    Cancel Ride
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/user/sos")}
                  className="w-full py-4 bg-red-600 hover:bg-[#d32f2f] text-white font-black text-sm rounded-2xl shadow flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <ShieldAlert size={20} />
                  <span>TRIGGER EMERGENCY SOS</span>
                </button>
              )}
            </div>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideTrackingPage;
