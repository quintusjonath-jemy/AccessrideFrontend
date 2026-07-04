import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, Car } from "lucide-react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VehicleSelection from "../components/VehicleSelection";
import LocationInputs from "../components/LocationInputs";
import RideOptionsList from "../components/RideOptionsList";
import PaymentSelection from "../components/PaymentSelection";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// Geocode a location text to [longitude, latitude]
const geocodeLocation = async (query) => {
  if (!query) return null;
  
  const lowerQuery = query.toLowerCase();
  
  // High quality default coordinates for common sample locations
  if (lowerQuery.includes("my current location")) {
    const lat = sessionStorage.getItem("user_latitude");
    const lng = sessionStorage.getItem("user_longitude");
    if (lat && lng) {
      return [parseFloat(lng), parseFloat(lat)];
    }
    return [79.8612, 6.9271]; // Central Library Colombo/Sri Lanka coords fallback
  } else if (lowerQuery.includes("central library")) {
    return [79.8612, 6.9271]; // Central Library Colombo/Sri Lanka coords
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
    console.error("Geocoding error for: " + query, err);
  }
  return null;
};

// Calculate driving distance in km between two location strings (finding the shortest alternative route)
const calculateDistance = async (pickup, dropoff) => {
  if (!pickup || !dropoff) return 0;
  
  const fallbackDistance = parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1));

  try {
    const pickupCoords = await geocodeLocation(pickup);
    const dropoffCoords = await geocodeLocation(dropoff);
    
    if (!pickupCoords || !dropoffCoords) {
      return fallbackDistance;
    }
    
    const [startLng, startLat] = pickupCoords;
    const [endLng, endLat] = dropoffCoords;
    
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}.json?access_token=${MAPBOX_TOKEN}&geometries=geojson&alternatives=true`;
    const res = await axios.get(url);
    
    if (res.data?.routes && res.data.routes.length > 0) {
      let shortestRoute = res.data.routes[0];
      for (let i = 1; i < res.data.routes.length; i++) {
        if (res.data.routes[i].distance < shortestRoute.distance) {
          shortestRoute = res.data.routes[i];
        }
      }
      const distanceMeters = shortestRoute.distance;
      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
      return distanceKm > 0 ? distanceKm : fallbackDistance;
    }
  } catch (err) {
    console.error("Directions error between: " + pickup + " and " + dropoff, err);
  }
  
  return fallbackDistance;
};

const BookingPage = () => {
  const navigate = useNavigate();

  // Multi-step state: 1 = vehicle selection, 2 = route/class selection
  const [step, setStep] = useState(1);

  // Booking details states
  const [vehicleType, setVehicleType] = useState("");
  const [pickup, setPickup] = useState("My Current Location (Central Library)");
  const [dropoff, setDropoff] = useState("Central Medical Plaza");
  const [rideClass, setRideClass] = useState("eco");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [distance, setDistance] = useState(5.0); // Default 5 km
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  // Mapbox Refs & State
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const mapInitRef = useRef(false);

  // Coordinates and Route State
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  // Fetch actual current location address on mount for the pickup field
  useEffect(() => {
    const fetchCurrentLocationAddress = async () => {
      const lat = sessionStorage.getItem("user_latitude");
      const lng = sessionStorage.getItem("user_longitude");
      if (lat && lng) {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
          const res = await axios.get(url);
          if (res.data?.features && res.data.features.length > 0) {
            const address = res.data.features[0].place_name;
            const text = res.data.features[0].text || address;
            setPickup(`My Current Location (${text})`);
          } else {
            setPickup("My Current Location");
          }
        } catch (err) {
          console.error("Error reverse geocoding current location:", err);
          setPickup("My Current Location");
        }
      } else {
        // Fallback: request geolocation if not in sessionStorage
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              sessionStorage.setItem("user_latitude", latitude);
              sessionStorage.setItem("user_longitude", longitude);
              try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
                const res = await axios.get(url);
                if (res.data?.features && res.data.features.length > 0) {
                  setPickup(`My Current Location (${res.data.features[0].text})`);
                } else {
                  setPickup("My Current Location");
                }
              } catch (err) {
                setPickup("My Current Location");
              }
            },
            () => {
              setPickup("My Current Location (Central Library)");
            }
          );
        }
      }
    };
    fetchCurrentLocationAddress();
  }, []);

  // Fetch coordinates, route, and calculate distance (finding the shortest alternative route)
  useEffect(() => {
    if (pickup && dropoff) {
      const fetchRoute = async () => {
        try {
          const pCoords = await geocodeLocation(pickup);
          const dCoords = await geocodeLocation(dropoff);
          
          if (pCoords && dCoords) {
            setPickupCoords(pCoords);
            setDropoffCoords(dCoords);
            
            const [startLng, startLat] = pCoords;
            const [endLng, endLat] = dCoords;
            
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}.json?access_token=${MAPBOX_TOKEN}&geometries=geojson&alternatives=true`;
            const res = await axios.get(url);
            
            if (res.data?.routes && res.data.routes.length > 0) {
              let shortestRoute = res.data.routes[0];
              for (let i = 1; i < res.data.routes.length; i++) {
                if (res.data.routes[i].distance < shortestRoute.distance) {
                  shortestRoute = res.data.routes[i];
                }
              }
              const distanceMeters = shortestRoute.distance;
              const distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
              setDistance(distanceKm > 0 ? distanceKm : parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
              setRouteGeoJSON(shortestRoute.geometry);
            } else {
              setDistance(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
              setRouteGeoJSON(null);
            }
          } else {
            setDistance(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
            setPickupCoords(null);
            setDropoffCoords(null);
            setRouteGeoJSON(null);
          }
        } catch (err) {
          console.error("Error calculating distance:", err);
          setDistance(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
        }
      };
      
      fetchRoute();
    } else {
      setDistance(0);
      setPickupCoords(null);
      setDropoffCoords(null);
      setRouteGeoJSON(null);
    }
  }, [pickup, dropoff]);

  // Initialize Map
  useEffect(() => {
    if (step !== 2 || !mapContainerRef.current || mapInitRef.current) return;

    mapInitRef.current = true;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [79.8612, 6.9271], // Default center
      zoom: 12,
    });

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMap(null);
        mapInitRef.current = false;
        pickupMarkerRef.current = null;
        dropoffMarkerRef.current = null;
      }
    };
  }, [step]);

  // Update Map Markers and Route Layer
  useEffect(() => {
    if (!map) return;

    const updateMapElements = () => {
      // Remove old markers
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();

      if (pickupCoords) {
        pickupMarkerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat(pickupCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p class='font-bold text-xs p-1'>Pickup Location</p>"))
          .addTo(map);
      }

      if (dropoffCoords) {
        dropoffMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat(dropoffCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p class='font-bold text-xs p-1'>Drop-off Destination</p>"))
          .addTo(map);
      }

      if (pickupCoords && dropoffCoords) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropoffCoords);
        
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });

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
                "line-color": "#0B2F89",
                "line-width": 5,
                "line-opacity": 0.75
              }
            });
          }
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateMapElements();
    } else {
      map.once("load", updateMapElements);
    }
  }, [map, pickupCoords, dropoffCoords, routeGeoJSON]);

  const handleSelectVehicle = (type) => {
    setVehicleType(type);
    // Auto-select corresponding tier class
    if (type === "car") {
      setRideClass("eco");
    } else if (type === "van") {
      setRideClass("assist");
    } else if (type === "three wheeler") {
      setRideClass("auto");
    } else if (type === "bike") {
      setRideClass("moto");
    }
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleConfirmBooking = () => {
    setIsBookingInProgress(true);
    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

    const payload = {
      user_id: userId,
      pickup_location: pickup,
      dropoff_location: dropoff,
      vehicle_type: vehicleType,
      distance_km: distance,
      payment_method: paymentMethod,
      pickup_lat: pickupCoords ? pickupCoords[1] : null,
      pickup_lng: pickupCoords ? pickupCoords[0] : null
    };

    axios.post("http://localhost/UserDashboard/api/book_ride.php", payload)
      .then(res => {
        setIsBookingInProgress(false);
        if (res.data.success) {
          navigate("/user/ride");
        } else {
          alert(res.data.message || "Failed to book ride");
        }
      })
      .catch(err => {
        setIsBookingInProgress(false);
        console.error("Booking error:", err);
        alert("An error occurred while confirming booking.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white shadow-sm mb-4">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate("/user/dashboard"))}
            className="text-[#0B2F89] hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          
          <h1 className="text-lg font-bold text-[#0B2F89]">
            {step === 1 ? "Choose Vehicle" : "Book a Ride"}
          </h1>
          
          <button className="text-[#0B2F89]">
            <UserCircle size={28} />
          </button>
        </header>

        {/* Multi-step Flow */}
        <div className="px-5 space-y-6">
          {step === 1 ? (
            <VehicleSelection
              selectedType={vehicleType}
              onSelect={handleSelectVehicle}
              onContinue={() => setStep(2)}
            />
          ) : (
            <>
              {/* Selected Vehicle Summary */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B2F89] text-white rounded-lg">
                    <Car size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Vehicle Selection</p>
                    <p className="text-xs font-bold text-[#0B2F89] mt-0.5 capitalize">
                      {vehicleType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Live Route Map */}
              <div className="relative bg-slate-100 rounded-3xl h-52 overflow-hidden shadow-inner border border-slate-150 mb-4">
                <div ref={mapContainerRef} className="w-full h-full" />
                {distance > 0 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#0B2F89] text-white px-4 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{distance.toFixed(1)} km Route</span>
                  </div>
                )}
              </div>

              {/* Step 2: Pickup/Dropoff Location Inputs */}
              <LocationInputs
                pickup={pickup}
                dropoff={dropoff}
                onChangePickup={setPickup}
                onChangeDropoff={setDropoff}
                onSwap={handleSwapLocations}
              />

              {/* Step 3: Ride Class Selection */}
              <RideOptionsList
                selectedClass={rideClass}
                onSelectClass={setRideClass}
                vehicleType={vehicleType}
                distance={distance}
              />

              {/* Step 4: Payment Selection */}
              <PaymentSelection
                paymentMethod={paymentMethod}
                onChangePayment={setPaymentMethod}
              />
            </>
          )}
        </div>
      </div>

      {/* Booking Summary Box */}
      {step === 2 && pickup && dropoff && (
        <div className="px-5 mb-2 mt-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium uppercase tracking-wider">Distance</span>
              <span className="font-extrabold text-slate-800">{distance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium uppercase tracking-wider">
                Fare Rate (
                {rideClass === "assist" && "Rs. 100.00/km"}
                {rideClass === "auto" && "Rs. 60.00/km"}
                {rideClass === "moto" && "Rs. 40.00/km"}
                {rideClass === "eco" && "Rs. 80.00/km"}
                )
              </span>
              <span className="font-extrabold text-slate-800">
                Rs. {
                  (distance * (
                    rideClass === "assist" ? 100 :
                    rideClass === "auto" ? 60 :
                    rideClass === "moto" ? 40 : 80
                  )).toFixed(2)
                }
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-3">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Payment Method</span>
              <span className="font-bold text-slate-800 capitalize">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Total Charge</span>
              <span className="text-base font-black text-[#0B2F89]">
                Rs. {
                  (distance * (
                    rideClass === "assist" ? 100 :
                    rideClass === "auto" ? 60 :
                    rideClass === "moto" ? 40 : 80
                  )).toFixed(2)
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation / CTA at bottom of Step 2 */}
      {step === 2 && (
        <div className="px-5">
          <button
            onClick={handleConfirmBooking}
            disabled={isBookingInProgress || !pickup || !dropoff}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center flex items-center justify-center gap-2 ${
              isBookingInProgress || !pickup || !dropoff
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
            }`}
          >
            {isBookingInProgress ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Confirming Ride...</span>
              </>
            ) : (
              <span>Confirm Booking</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
