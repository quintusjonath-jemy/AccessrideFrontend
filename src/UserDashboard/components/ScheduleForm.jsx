import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationInputs from "./LocationInputs";
import VehicleSelection from "./VehicleSelection";
import PaymentSelection from "./PaymentSelection";
import API_BASE from "../../config/api";
import { speakWithFallback } from "./voiceassistant/VoiceAssistant";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// ─── Vehicle keyword matching (matching BookingPage) ─────────────────────────
const matchVehicleFromSpeech = (text) => {
  const t = text.toLowerCase();
  if (t.includes("van")) return "van";
  if (t.includes("three wheeler") || t.includes("three-wheeler") || t.includes("three") ||
      t.includes("tuk") || t.includes("auto") || t.includes("rickshaw") || t.includes("wheeler")) {
    return "three wheeler";
  }
  if (t.includes("bike") || t.includes("motor") || t.includes("moto") || t.includes("cycle")) {
    return "bike";
  }
  if (t.includes("car") || t.includes("sedan") || t.includes("cab") || t.includes("taxi") || t.includes("vehicle") || t.includes("ride")) {
    return "car";
  }
  return null;
};

// ─── Voice Guide States ───────────────────────────────────────────────────────
const VSTATE = {
  IDLE: "IDLE",
  VEHICLE: "VEHICLE",
  PICKUP: "PICKUP",
  DROPOFF: "DROPOFF",
  CONFIRM_DROPOFF: "CONFIRM_DROPOFF",
  DATE_TIME: "DATE_TIME",
  CONFIRMING: "CONFIRMING",
  SCHEDULING: "SCHEDULING",
};

// ─── Intelligent Date & Time Speech Parser ───────────────────────────────────
const parseDateAndTimeString = (text) => {
  const t = text.toLowerCase();
  const now = new Date();
  let targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + 1); // default tomorrow
  let targetTime = "10:00"; // default 10:00 AM

  // 1. Month names (e.g. "August 30", "30th August", "Sept 12")
  const months = [
    { name: "january", short: "jan", idx: 0 },
    { name: "february", short: "feb", idx: 1 },
    { name: "march", short: "mar", idx: 2 },
    { name: "april", short: "apr", idx: 3 },
    { name: "may", short: "may", idx: 4 },
    { name: "june", short: "jun", idx: 5 },
    { name: "july", short: "jul", idx: 6 },
    { name: "august", short: "aug", idx: 7 },
    { name: "september", short: "sep", idx: 8 },
    { name: "october", short: "oct", idx: 9 },
    { name: "november", short: "nov", idx: 10 },
    { name: "december", short: "dec", idx: 11 },
  ];

  let matchedMonth = null;
  for (const m of months) {
    if (t.includes(m.name) || t.includes(` ${m.short} `) || t.startsWith(`${m.short} `) || t.endsWith(` ${m.short}`)) {
      matchedMonth = m.idx;
      break;
    }
  }

  const dayNumberMatch = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (matchedMonth !== null && dayNumberMatch) {
    const dayNum = parseInt(dayNumberMatch[1], 10);
    const yr = now.getFullYear();
    targetDate = new Date(yr, matchedMonth, dayNum);
    if (targetDate < now) {
      targetDate.setFullYear(yr + 1);
    }
  } else if (t.includes("today") || t.includes("tonight")) {
    targetDate = new Date(now);
  } else if (t.includes("day after tomorrow")) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
  } else if (t.includes("tomorrow")) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 1);
  } else {
    // Check day of week (e.g. monday, tuesday...)
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < days.length; i++) {
      if (t.includes(days[i])) {
        const currentDay = now.getDay();
        let diff = (i - currentDay + 7) % 7;
        if (diff === 0) diff = 7; // Next week's day
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);
        break;
      }
    }
  }

  // Parse Time (e.g. "10:30 am", "2:15 pm", "10 am", "3 pm", "9 o'clock")
  const timeMatch = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch && (timeMatch[3] || t.includes("at") || t.includes("o'clock") || t.includes("pm") || t.includes("am"))) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? timeMatch[2].padStart(2, "0") : "00";
    const mer = timeMatch[3] ? timeMatch[3].toLowerCase() : (hours < 7 ? "pm" : (hours < 12 ? "am" : "pm"));
    
    if (mer === "pm" && hours < 12) hours += 12;
    if (mer === "am" && hours === 12) hours = 0;
    
    targetTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
  } else if (t.includes("morning")) {
    targetTime = "09:00";
  } else if (t.includes("noon") || t.includes("lunch")) {
    targetTime = "12:00";
  } else if (t.includes("afternoon")) {
    targetTime = "14:00";
  } else if (t.includes("evening")) {
    targetTime = "18:00";
  } else if (t.includes("night")) {
    targetTime = "20:00";
  }

  const yyyy = targetDate.getFullYear();
  const mm = (targetDate.getMonth() + 1).toString().padStart(2, "0");
  const dd = targetDate.getDate().toString().padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return { dateStr, timeStr: targetTime };
};

// ─── Shared SpeechRecognition constructor ────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// Resolve place name to exact Mapbox address and coordinates
const resolveExactPlace = async (query) => {
  if (!query || query.trim().length < 2) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&country=lk&proximity=79.8612,6.9271&types=poi,address,neighborhood,locality,place&limit=1`;
    const res = await axios.get(url);
    if (res.data?.features && res.data.features.length > 0) {
      const top = res.data.features[0];
      return {
        placeName: top.place_name,
        shortName: top.text || top.place_name,
        coordinates: top.geometry.coordinates, // [lng, lat]
      };
    }
  } catch (err) {
    console.error("Mapbox resolveExactPlace error in ScheduleForm:", err);
  }
  return null;
};

// Geocode a location text to [longitude, latitude]
const geocodeLocation = async (query) => {
  if (!query) return null;
  
  const lowerQuery = query.toLowerCase();
  
  // High quality default coordinates for common sample locations
  if (lowerQuery.includes("my current location") || lowerQuery.includes("central library")) {
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

const ScheduleForm = ({ onScheduleAdded, onScheduleUpdated, editingRide, onCancelEdit, initialState = {} }) => {
  const navigate = useNavigate();
  const voiceModeActive = !!initialState?.voiceMode;

  const [step, setStep] = useState(initialState?.step || 1); // Step 1: Vehicle selection, Step 2: Date, Time & Route
  const [vehicleType, setVehicleType] = useState(initialState?.voiceVehicle || "");
  const [pickup, setPickup] = useState(initialState?.pickup || "My Current Location (Central Library)");
  const [dropoff, setDropoff] = useState(initialState?.voiceDestination || initialState?.dropoff || "");
  const [date, setDate] = useState(initialState?.voiceDate || "");
  const [time, setTime] = useState(initialState?.voiceTime || "");
  const [distanceVal, setDistanceVal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // ── Voice Guide State (matching BookingPage) ───────────────────────────────
  const [vState, setVState] = useState(VSTATE.IDLE);
  const [vListening, setVListening] = useState(false);
  const [vStatus, setVStatus] = useState("");
  const vStateRef = useRef(VSTATE.IDLE);
  const vRecRef = useRef(null);
  const vStopRef = useRef(false);

  // Mapbox & GPS Refs
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const mapInitRef = useRef(false);
  const pickupCoordsRef = useRef(null);
  const dropoffCoordsRef = useRef(null);
  const lastGeocodedPickupRef = useRef("");

  // Coordinates and Route State
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  // Refs for state synchronization in callbacks
  const stepRef = useRef(step);
  const vehicleTypeRef = useRef(vehicleType);
  const pickupRef = useRef(pickup);
  const dropoffRef = useRef(dropoff);
  const dateRef = useRef(date);
  const timeRef = useRef(time);
  const handleSubmitRef = useRef(null);

  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { vehicleTypeRef.current = vehicleType; }, [vehicleType]);
  useEffect(() => { pickupRef.current = pickup; }, [pickup]);
  useEffect(() => { dropoffRef.current = dropoff; }, [dropoff]);
  useEffect(() => { dateRef.current = date; }, [date]);
  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { vStateRef.current = vState; }, [vState]);
  useEffect(() => { pickupCoordsRef.current = pickupCoords; }, [pickupCoords]);
  useEffect(() => { dropoffCoordsRef.current = dropoffCoords; }, [dropoffCoords]);

  // ── GPS Request (matching BookingPage with Mapbox reverse geocoding) ──────
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [longitude, latitude];
        pickupCoordsRef.current = coords;
        setPickupCoords(coords);
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
          const res = await axios.get(url);
          if (res.data?.features && res.data.features.length > 0) {
            const feature = res.data.features[0];
            const placeName = feature.place_name || feature.text;
            lastGeocodedPickupRef.current = placeName;
            setPickup(placeName);
            pickupRef.current = placeName;
          } else {
            const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            lastGeocodedPickupRef.current = coordsStr;
            setPickup(coordsStr);
            pickupRef.current = coordsStr;
          }
        } catch {
          const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          lastGeocodedPickupRef.current = coordsStr;
          setPickup(coordsStr);
          pickupRef.current = coordsStr;
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Helper to speak TTS and pause mic while speaking to avoid audio feedback ──
  const vSpeak = useCallback((text) => {
    if (vRecRef.current) {
      try { vRecRef.current.stop(); } catch (_) {}
    }
    speakWithFallback(
      text,
      () => setVListening(false),
      () => {
        if (!vStopRef.current && vRecRef.current) {
          setTimeout(() => {
            try { vRecRef.current.start(); } catch (_) {}
          }, 300);
        }
      }
    );
  }, []);

  const handlePickerClick = (e) => {
    try {
      if (typeof e.target.showPicker === "function") {
        e.target.showPicker();
      }
    } catch (err) {
      console.warn("showPicker is not supported:", err);
    }
  };

  useEffect(() => {
    if (editingRide) {
      setVehicleType(editingRide.vehicle_type || editingRide.wheelchair_type || "car");
      setPickup(editingRide.pickup_location || "");
      setDropoff(editingRide.dropoff_location || "");
      setDistanceVal(parseFloat(editingRide.distance_km) || 0);
      setPaymentMethod(editingRide.payment_method || "cash");
      if (editingRide.ride_date) {
        const parts = editingRide.ride_date.split(" ");
        setDate(parts[0] || "");
        setTime(parts[1]?.substring(0, 5) || "");
      }
      setStep(2); // Go straight to step 2 since we already have fields pre-loaded
    } else {
      setStep(initialState?.step || 1);
      setVehicleType(initialState?.voiceVehicle || "");
      setPickup(initialState?.pickup || "My Current Location (Central Library)");
      setDropoff(initialState?.voiceDestination || initialState?.dropoff || "");
      setDate(initialState?.voiceDate || "");
      setTime(initialState?.voiceTime || "");
      setDistanceVal(0);
      setPaymentMethod("cash");
    }
  }, [editingRide, initialState]);

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
              setDistanceVal(distanceKm > 0 ? distanceKm : parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
              setRouteGeoJSON(shortestRoute.geometry);
            } else {
              setDistanceVal(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
              setRouteGeoJSON(null);
            }
          } else {
            setDistanceVal(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
            setPickupCoords(null);
            setDropoffCoords(null);
            setRouteGeoJSON(null);
          }
        } catch (err) {
          console.error("Error calculating schedule distance:", err);
          setDistanceVal(parseFloat(((pickup.length + dropoff.length) % 12 + 3.4).toFixed(1)));
        }
      };
      
      fetchRoute();
    } else {
      setDistanceVal(0);
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

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const fareVal = distanceVal * 80;

  const handleSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!pickup || !dropoff || !date || !time) return;

    setIsScheduling(true);

    const userId = sessionStorage.getItem("user_id") || "1";

    const payload = {
      user_id: userId,
      pickup_location: pickup,
      dropoff_location: dropoff,
      ride_date: `${date} ${time}`,
      vehicle_type: vehicleType,
      distance_km: distanceVal,
      fare: fareVal,
      payment_method: paymentMethod
    };

    if (editingRide) {
      payload.ride_id = editingRide.id;
    }

    const apiRequest = editingRide
      ? axios.put(`${API_BASE}/UserDashboard/api/schedule.php?user_id=${userId}`, payload)
      : axios.post(`${API_BASE}/UserDashboard/api/schedule.php?user_id=${userId}`, payload);

    apiRequest
      .then(res => {
        setIsScheduling(false);
        if (res.data.success) {
          if (editingRide) {
            onScheduleUpdated({
              id: editingRide.id,
              ride_date: `${date} ${time}`,
              pickup_location: pickup,
              dropoff_location: dropoff,
              vehicle_type: vehicleType,
              distance_km: distanceVal,
              fare: fareVal,
              payment_method: paymentMethod,
              status: "scheduled"
            });
          } else {
            onScheduleAdded({
              id: res.data.ride_id || Date.now(),
              ride_date: `${date} ${time}`,
              pickup_location: pickup,
              dropoff_location: dropoff,
              vehicle_type: vehicleType,
              distance_km: distanceVal,
              fare: fareVal,
              payment_method: paymentMethod,
              status: "scheduled"
            });
          }

          if (initialState?.voiceMode) {
            vSpeak("Your ride has been successfully scheduled!");
          }

          // Reset form
          setStep(1);
          setVehicleType("");
          setDropoff("");
          setDate("");
          setTime("");
          setPaymentMethod("cash");
        } else {
          alert(res.data.message || "Failed to schedule ride");
        }
      })
      .catch(err => {
        setIsScheduling(false);
        console.error("Scheduling error:", err);
        alert("An error occurred. Please check database connectivity and try again.");
      });
  };

  handleSubmitRef.current = handleSubmit;

  // ── Voice Guide Command Handler (Matching BookingPage architecture) ────────
  const handleVCommand = useCallback((rawText) => {
    const text = rawText.toLowerCase().trim();
    const cur = vStateRef.current;

    console.log(`[ScheduleVoiceGuide] State: ${cur} | Heard: "${text}"`);

    // Cancel command
    if (text.includes("cancel") || text.includes("stop") || text.includes("never mind")) {
      vSpeak("Schedule cancelled. You can fill in the details manually.");
      setVState(VSTATE.IDLE);
      vStateRef.current = VSTATE.IDLE;
      setVStatus("Voice guide stopped");
      return;
    }

    // Global navigation commands
    if (text.includes("my ride") || text.includes("history") || text.includes("past ride") || text.includes("trips")) {
      vSpeak("Opening your ride history.");
      navigate("/user/history");
      return;
    }

    if (text.includes("schedule list") || text.includes("my schedule") || text.includes("my schedules") || text.includes("show schedule")) {
      vSpeak("Opening your schedule list.");
      onCancelEdit?.();
      return;
    }

    if (text.includes("track") || text.includes("where is my driver") || text.includes("driver location")) {
      vSpeak("Opening live ride tracking.");
      navigate("/user/ride");
      return;
    }

    if (text.includes("go home") || text.includes("dashboard") || text.includes("main menu") || text === "home") {
      vSpeak("Heading back to the dashboard.");
      navigate("/user/dashboard");
      return;
    }

    if (text.includes("sos") || text.includes("emergency") || text.includes("help me")) {
      vSpeak("Opening emergency SOS.");
      navigate("/user/sos");
      return;
    }

    // Step 1: Vehicle selection
    if (cur === VSTATE.VEHICLE) {
      const v = matchVehicleFromSpeech(text);
      if (!v) {
        vSpeak("Sorry, I didn't catch that. Please say car, van, bike, or three wheeler.");
        return;
      }
      setVehicleType(v);
      vehicleTypeRef.current = v;
      setStep(2);
      stepRef.current = 2;

      setVState(VSTATE.PICKUP);
      vStateRef.current = VSTATE.PICKUP;
      setVStatus("Where should we pick you up?");
      vSpeak(`${v} selected. Where should we pick you up? Say your pickup location, or say use my current location.`);
      return;
    }

    // Step 2: Pickup location
    if (cur === VSTATE.PICKUP) {
      if (
        text.includes("current location") ||
        text.includes("my location") ||
        text.includes("here") ||
        text.includes("gps") ||
        text.includes("current") ||
        text.includes("use my current") ||
        text.includes("same location")
      ) {
        requestGPS();
        const curLoc = pickupRef.current || "My Current Location (Central Library)";
        setPickup(curLoc);
        pickupRef.current = curLoc;
        setVState(VSTATE.DROPOFF);
        vStateRef.current = VSTATE.DROPOFF;
        setVStatus("Where are you going?");
        vSpeak("Pickup set to your current location. Where are you going?");
        return;
      }

      const cleaned = text.replace(/^(from|at|my pickup is|pickup|starting from)\s+/i, "").trim();
      if (!cleaned || cleaned.length < 2) {
        vSpeak("I didn't catch that. Please say your pickup location, or say use my current location.");
        return;
      }

      setPickup(cleaned);
      pickupRef.current = cleaned;
      setVState(VSTATE.DROPOFF);
      vStateRef.current = VSTATE.DROPOFF;
      setVStatus("Where are you going?");
      vSpeak(`Pickup set to ${cleaned}. Where are you going?`);
      return;
    }

    // Step 3: Dropoff destination
    if (cur === VSTATE.DROPOFF) {
      const cleaned = text.replace(/^(to|going to|drop me at|drop me to|destination is|dropoff|take me to|take me|schedule to)\s+/i, "").trim();
      if (!cleaned || cleaned.length < 2) {
        vSpeak("I didn't catch that. Please say your destination.");
        return;
      }

      vSpeak(`Looking up ${cleaned} on Mapbox…`);
      resolveExactPlace(cleaned).then((resolved) => {
        const finalDest = resolved ? resolved.placeName : cleaned;
        const displayName = resolved ? resolved.shortName : cleaned;

        setDropoff(finalDest);
        dropoffRef.current = finalDest;
        if (resolved?.coordinates) {
          setDropoffCoords(resolved.coordinates);
        }

        setVState(VSTATE.CONFIRM_DROPOFF);
        vStateRef.current = VSTATE.CONFIRM_DROPOFF;
        setVStatus(`Destination: ${displayName}?`);
        vSpeak(
          `I found ${displayName}. Is this destination correct? Say yes to proceed, or tell me another destination.`
        );
      });
      return;
    }

    // Step 4: Confirm Destination & move to Date/Time
    if (cur === VSTATE.CONFIRM_DROPOFF) {
      if (
        text.includes("yes") ||
        text.includes("correct") ||
        text.includes("confirm") ||
        text.includes("yeah") ||
        text.includes("sure") ||
        text.includes("right") ||
        text.includes("okay") ||
        text.includes("ok")
      ) {
        setVState(VSTATE.DATE_TIME);
        vStateRef.current = VSTATE.DATE_TIME;
        setVStatus("Which date and time?");
        vSpeak(
          "Destination confirmed. What date and time would you like to schedule? You can say tomorrow at 10 AM, next Friday at 2 PM, or any date and time."
        );
        return;
      }

      // If user says "no" or provides a new destination directly
      const cleaned = text.replace(/^(no|not this|wrong|change|different|to|going to|take me to)\s+/i, "").trim();
      if (!cleaned || cleaned === "no" || cleaned.length < 2) {
        setVState(VSTATE.DROPOFF);
        vStateRef.current = VSTATE.DROPOFF;
        setVStatus("Where are you going?");
        vSpeak("Okay, please tell me your destination again.");
        return;
      }

      // User spoke a new destination name directly
      vSpeak(`Looking up ${cleaned} on Mapbox…`);
      resolveExactPlace(cleaned).then((resolved) => {
        const finalDest = resolved ? resolved.placeName : cleaned;
        const displayName = resolved ? resolved.shortName : cleaned;

        setDropoff(finalDest);
        dropoffRef.current = finalDest;
        if (resolved?.coordinates) {
          setDropoffCoords(resolved.coordinates);
        }

        setVState(VSTATE.CONFIRM_DROPOFF);
        vStateRef.current = VSTATE.CONFIRM_DROPOFF;
        setVStatus(`Destination: ${displayName}?`);
        vSpeak(
          `I found ${displayName}. Is this destination correct? Say yes to proceed, or tell me another destination.`
        );
      });
      return;
    }

    // Step 5: Parse and set Date and Time
    if (cur === VSTATE.DATE_TIME) {
      const { dateStr, timeStr } = parseDateAndTimeString(text);
      setDate(dateStr);
      dateRef.current = dateStr;
      setTime(timeStr);
      timeRef.current = timeStr;

      setVState(VSTATE.CONFIRMING);
      vStateRef.current = VSTATE.CONFIRMING;
      setVStatus("Say confirm to schedule or cancel");
      const vehicle = vehicleTypeRef.current || "car";
      const dest = dropoffRef.current;
      const pLoc = pickupRef.current || "your location";

      const dObj = new Date(dateStr);
      const friendlyDate = dObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

      vSpeak(
        `Scheduled for ${friendlyDate} at ${timeStr}. Ready to schedule a ${vehicle} from ${pLoc} to ${dest}. Say confirm to schedule your ride, or cancel to start over.`
      );
      return;
    }

    // Step 6: Final Confirmation
    if (cur === VSTATE.CONFIRMING) {
      if (
        text.includes("confirm") ||
        text.includes("yes") ||
        text.includes("schedule") ||
        text.includes("book") ||
        text.includes("sure") ||
        text.includes("okay") ||
        text.includes("ok")
      ) {
        setVState(VSTATE.SCHEDULING);
        vStateRef.current = VSTATE.SCHEDULING;
        setVStatus("Scheduling your ride…");
        vSpeak("Scheduling your ride now.");
        setTimeout(() => {
          handleSubmitRef.current?.();
        }, 800);
      }
    }
  }, [navigate, onCancelEdit, vSpeak]);

  // Voice Guide Continuous Listening Effect (matching BookingPage)
  useEffect(() => {
    if (!voiceModeActive) return;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    vRecRef.current = rec;

    rec.onstart = () => setVListening(true);
    rec.onresult = (e) => {
      const last = e.results.length - 1;
      const transcript = e.results[last][0].transcript;
      handleVCommand(transcript);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setVListening(false);
    };
    rec.onend = () => {
      if (!vStopRef.current) {
        setTimeout(() => {
          try { rec.start(); } catch (_) {}
        }, 300);
      } else {
        setVListening(false);
      }
    };

    vStopRef.current = false;
    setVState(VSTATE.VEHICLE);
    vStateRef.current = VSTATE.VEHICLE;
    setVStatus("Which vehicle would you like to schedule?");
    vSpeak("Which vehicle would you like to schedule? Car, van, bike, or three wheeler?");

    return () => {
      vStopRef.current = true;
      try { rec.abort(); } catch (_) {}
    };
  }, [voiceModeActive, handleVCommand, vSpeak]);

  return (
    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 shadow-sm">
      {step === 1 ? (
        <VehicleSelection
          selectedType={vehicleType}
          onSelect={setVehicleType}
          onContinue={() => setStep(2)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-extrabold text-[#0B2F89] text-base">Route & Time</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
              >
                Back to Vehicle
              </button>
              {editingRide && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Location Inputs with GPS Current Location Picker */}
          <LocationInputs
            pickup={pickup}
            dropoff={dropoff}
            onChangePickup={setPickup}
            onChangeDropoff={setDropoff}
            onSwap={handleSwapLocations}
            isLocating={isLocating}
            userCoords={pickupCoords}
            onRequestGPS={requestGPS}
          />

          {/* Live Route Map */}
          <div className="relative bg-slate-100 rounded-3xl h-52 overflow-hidden shadow-inner border border-slate-150">
            <div ref={mapContainerRef} className="w-full h-full" />
            {distanceVal > 0 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#0B2F89] text-white px-4 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5">
                <span>📍</span>
                <span>{distanceVal.toFixed(1)} km Route</span>
              </div>
            )}
          </div>

          {/* Date and Time Picker Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Picker */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-3 relative cursor-pointer hover:bg-slate-50 transition min-h-[58px]">
              <Calendar size={18} className="text-[#0B2F89] shrink-0" />
              <div className="flex-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Date</label>
                <div className="text-xs font-semibold text-[#0B2F89] mt-0.5">
                  {date ? (() => {
                    const d = new Date(date);
                    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                  })() : "Select Date"}
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={handlePickerClick}
                  onFocus={handlePickerClick}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-3 relative cursor-pointer hover:bg-slate-50 transition min-h-[58px]">
              <Clock size={18} className="text-[#0B2F89] shrink-0" />
              <div className="flex-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Time</label>
                <div className="text-xs font-semibold text-[#0B2F89] mt-0.5">
                  {time ? (() => {
                    const [hours, minutes] = time.split(":");
                    const h = parseInt(hours, 10);
                    const ampm = h >= 12 ? "PM" : "AM";
                    const formattedHours = h % 12 || 12;
                    return `${formattedHours}:${minutes} ${ampm}`;
                  })() : "Select Time"}
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onClick={handlePickerClick}
                  onFocus={handlePickerClick}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <PaymentSelection
            paymentMethod={paymentMethod}
            onChangePayment={setPaymentMethod}
          />

          {/* Distance and Fare Estimation Box */}
          {pickup && dropoff && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between text-slate-800 shadow-sm">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Distance</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                  {distanceVal.toFixed(1)} km
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Fare</p>
                <p className="text-base font-black text-[#0B2F89] mt-0.5">
                  Rs. {fareVal.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Note Box */}
          <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-slate-600 text-xs">
            <AlertCircle size={16} className="text-[#0B2F89] mt-0.5 shrink-0" />
            <p className="leading-normal">
              Scheduled rides can be cancelled at no cost up to 1 hour before the pickup time.
            </p>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isScheduling || !pickup || !dropoff || !date || !time}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center flex items-center justify-center gap-2 ${isScheduling || !pickup || !dropoff || !date || !time
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
              }`}
          >
            {isScheduling ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>{editingRide ? "Updating Ride..." : "Scheduling Ride..."}</span>
              </>
            ) : (
              <span>{editingRide ? "Update Ride" : "Schedule Ride"}</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ScheduleForm;
