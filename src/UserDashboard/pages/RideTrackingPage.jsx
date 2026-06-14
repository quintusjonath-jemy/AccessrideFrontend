import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, ShieldAlert, Navigation, Car, Star } from "lucide-react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// Geocode a location text to [longitude, latitude]
const geocodeLocation = async (query) => {
  if (!query) return null;
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("my current location") || lowerQuery.includes("central library")) {
    return [79.8612, 6.9271];
  } else if (lowerQuery.includes("hospital") || lowerQuery.includes("medical")) {
    return [79.8732, 6.9012];
  } else if (lowerQuery.includes("plaza") || lowerQuery.includes("market")) {
    return [79.8501, 6.9321];
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=lk&limit=1`;
    const res = await axios.get(url);
    if (res.data?.features && res.data.features.length > 0) {
      return res.data.features[0].center; // [lng, lat]
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
  const mapInitRef = useRef(false);

  // Map Coordinates State
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [displayDistance, setDisplayDistance] = useState(null);
  const [userLiveCoords, setUserLiveCoords] = useState(null);

  const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

  // Function to fetch the active ride from backend
  const fetchActiveRide = async (isFirstLoad = false) => {
    try {
      const res = await axios.get(`http://localhost/UserDashboard/api/active_ride.php?user_id=${userId}`);
      if (res.data.success && res.data.data) {
        const rideData = res.data.data;
        setRide(rideData);

        // Resolve coordinates
        const pCoords = await geocodeLocation(rideData.pickup_location);
        const dCoords = await geocodeLocation(rideData.dropoff_location);
        setPickupCoords(pCoords);
        setDropoffCoords(dCoords);

        // Resolve driver coordinates or set fallback close to pickup
        let drvCoords = null;
        if (rideData.driver_lat && rideData.driver_lng) {
          drvCoords = [rideData.driver_lng, rideData.driver_lat];
        } else if (pCoords) {
          // Mock driver coordinate offset slightly for live UI effect if not set
          drvCoords = [pCoords[0] - 0.005, pCoords[1] + 0.003];
        }
        setDriverCoords(drvCoords);

        // Determine start and end points for the route depending on status
        let startPoint = null;
        let endPoint = null;

        if (rideData.status === "pending" || rideData.status === "accepted") {
          startPoint = drvCoords;
          endPoint = userLiveCoords || pCoords;
        } else {
          startPoint = pCoords;
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
        setRide(null);
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
          if (pickupLocation) {
            const match = pickupLocation.match(/\(Vehicle:\s*([^\)]+)\)/i);
            if (match) {
              type = match[1].trim().toLowerCase();
            }
          }
          if (!type) {
            type = (driverType || vehicleType || "car").toLowerCase().trim();
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

      // Fit bounds to show relevant markers based on status
      const bounds = new mapboxgl.LngLatBounds();
      let hasCoords = false;
      if (ride?.status === "pending" || ride?.status === "accepted") {
        if (driverCoords) { bounds.extend(driverCoords); hasCoords = true; }
        if (pickupCoords) { bounds.extend(pickupCoords); hasCoords = true; }
      } else {
        if (pickupCoords) { bounds.extend(pickupCoords); hasCoords = true; }
        if (dropoffCoords) { bounds.extend(dropoffCoords); hasCoords = true; }
      }

      if (hasCoords) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
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
  }, [map, pickupCoords, dropoffCoords, driverCoords, routeGeoJSON, ride?.status, displayDistance]);

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
                  const match = ride.pickup_location?.match(/\(Vehicle:\s*([^\)]+)\)/i);
                  if (match) {
                    const type = match[1].trim().toLowerCase();
                    let emoji = "🚗";
                    if (type.includes("bike") || type.includes("motorcycle")) emoji = "🏍️";
                    else if (type.includes("van") || type.includes("suv")) emoji = "🚐";
                    else if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) emoji = "🛺";
                    return (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold gap-1 border border-blue-100">
                        {emoji} {match[1]}
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
          <div className="flex flex-col gap-2 border-t border-slate-50 pt-4">
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/user/sos")}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow flex items-center justify-center gap-2 transition cursor-pointer"
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
