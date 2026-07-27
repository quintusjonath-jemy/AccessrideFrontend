import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UserCircle, Car, Mic, MicOff } from "lucide-react";
import axios from "axios";
import { speakWithFallback } from "../components/voiceassistant/VoiceAssistant";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import VehicleSelection from "../components/VehicleSelection";
import LocationInputs from "../components/LocationInputs";
import RideOptionsList from "../components/RideOptionsList";
import PaymentSelection from "../components/PaymentSelection";
import API_BASE from "../../config/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// Sri Lanka geocoding constants
const COLOMBO_LNG = 79.8612;
const COLOMBO_LAT = 6.9271;

// Geocode a location text to [longitude, latitude] — restricted to Sri Lanka.
// Pass optional proximity [lng, lat] to bias results toward a specific area so
// ambiguous place names (e.g. "Udawela" near Colombo vs near Badulla) resolve
// to the correct local place rather than a distant match.
const geocodeLocation = async (query, proximity = null) => {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();

  // If the string literally carries GPS coords, extract them directly
  if (lowerQuery.startsWith("gps:")) {
    const [, lat, lng] = lowerQuery.split(":");
    if (lat && lng) return [parseFloat(lng), parseFloat(lat)];
  }

  // Use provided proximity, or fall back to Colombo as a general Sri Lanka center
  const [proxLng, proxLat] = proximity || [COLOMBO_LNG, COLOMBO_LAT];

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=lk&proximity=${proxLng},${proxLat}&limit=1`;
    const res = await axios.get(url);
    if (res.data?.features && res.data.features.length > 0) {
      return res.data.features[0].geometry.coordinates; // [lng, lat]
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

// ─── Vehicle keyword → BookingPage vehicle id ────────────────────────────────
const matchVehicleFromSpeech = (text) => {
  const t = text.toLowerCase();
  if (t.includes("van"))                                       return "van";
  if (t.includes("three wheeler") || t.includes("three-wheeler") ||
      t.includes("tuk") || t.includes("auto"))                 return "three wheeler";
  if (t.includes("bike") || t.includes("motor") || t.includes("moto")) return "bike";
  if (t.includes("car") || t.includes("sedan") || t.includes("cab"))   return "car";
  return null;
};

// ─── Voice guide states ───────────────────────────────────────────────────────
const VSTATE = {
  IDLE:       "IDLE",
  VEHICLE:    "VEHICLE",    // waiting for vehicle type
  PICKUP:     "PICKUP",     // waiting for pickup location
  DROPOFF:    "DROPOFF",    // waiting for dropoff location
  CONFIRMING: "CONFIRMING", // waiting for confirm / cancel
};

// ─── Shared SpeechRecognition constructor ────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  // Multi-step state: 1 = vehicle selection, 2 = route/class selection
  const [step, setStep] = useState(initialData.step || 1);

  // Voice mode flag — set to true when arriving via "book it" voice command
  const voiceModeActive = !!initialData.voiceMode;

  // Voice agent pre-fill: voiceDestination and voiceVehicle come from VoiceAssistant.jsx
  const voiceDestination = initialData.voiceDestination || "";
  const voiceVehicle     = initialData.voiceVehicle     || "";

  // Booking details states
  const [vehicleType, setVehicleType] = useState(voiceVehicle || initialData.vehicleType || "");
  const [pickup, setPickup] = useState(initialData.pickup || "");        // user types or uses GPS button
  const [dropoff, setDropoff] = useState(voiceDestination || initialData.dropoff || "");       // user enters manually
  const [isLocating, setIsLocating] = useState(false); // true only while GPS button resolves
  const [pickupCoords, setPickupCoords] = useState(null);
  const [rideClass, setRideClass] = useState("eco");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [distance, setDistance] = useState(0);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [rates, setRates] = useState({
    assist: 100.00,
    auto: 60.00,
    moto: 40.00,
    eco: 80.00
  });

  // ── Voice guide state for voiceMode ─────────────────────────────────────────
  const [vState, setVState]         = useState(VSTATE.IDLE);
  const [vListening, setVListening] = useState(false);
  const [vStatus, setVStatus]       = useState("");
  const vStateRef  = useRef(VSTATE.IDLE);
  const vRecRef    = useRef(null);
  const vStopRef   = useRef(false);    // true = user manually stopped
  const stepRef    = useRef(step);     // mirror step for callbacks
  const pickupRef  = useRef("");
  const dropoffRef = useRef("");
  const vTypeRef   = useRef("");

  // keep refs in sync
  useEffect(() => { stepRef.current = step; },       [step]);
  useEffect(() => { pickupRef.current  = pickup; },  [pickup]);
  useEffect(() => { dropoffRef.current = dropoff; }, [dropoff]);
  useEffect(() => { vTypeRef.current   = vehicleType; }, [vehicleType]);
  useEffect(() => { vStateRef.current  = vState; },  [vState]);

  useEffect(() => {
    axios.get(`${API_BASE}/UserDashboard/api/get_rates.php`)
      .then(res => {
        if (res.data?.success && res.data.rates) {
          const r = res.data.rates;
          setRates({
            assist: parseFloat(r['van'] ?? 100.00),
            auto: parseFloat(r['three wheeler'] ?? 60.00),
            moto: parseFloat(r['bike'] ?? 40.00),
            eco: parseFloat(r['car'] ?? 80.00)
          });
        }
      })
      .catch(err => console.error("Error fetching rates:", err));
  }, []);

  // ── Voice Guide: full step-by-step when voiceModeActive ─────────────────────
  // handleVCommand processes each spoken phrase and moves the booking forward
  const handleVCommand = useCallback((rawText) => {
    const text = rawText.toLowerCase().trim();
    const cur  = vStateRef.current;

    // Cancel at any point
    if (text.includes("cancel") || text.includes("never mind") || text.includes("stop")) {
      speakWithFallback("Cancelled. You can fill in the details manually.");
      setVState(VSTATE.IDLE);
      setVStatus("Voice guide stopped");
      return;
    }

    // ── VEHICLE step ─────────────────────────────────────────────────────────
    if (cur === VSTATE.VEHICLE) {
      const v = matchVehicleFromSpeech(text);
      if (!v) {
        speakWithFallback("Sorry, I didn't catch that. Please say car, van, bike, or three wheeler.");
        return;
      }
      // Programmatically select the vehicle (same as clicking it)
      handleSelectVehicle(v);
      // Move to step 2
      setStep(2);
      setVState(VSTATE.PICKUP);
      setVStatus("What is your pickup location?");
      setTimeout(() => {
        speakWithFallback(`${v} selected. Now, what is your pickup location?`);
      }, 400);
      return;
    }

    // ── PICKUP step ──────────────────────────────────────────────────────────
    if (cur === VSTATE.PICKUP) {
      const cleaned = text.replace(/^(from|at|my pickup is|pickup|starting from)\s+/i, "").trim();
      if (!cleaned || cleaned.length < 2) {
        speakWithFallback("I didn't catch that. Please say your pickup location.");
        return;
      }
      setPickup(cleaned);
      setVState(VSTATE.DROPOFF);
      setVStatus("Where are you going?");
      setTimeout(() => {
        speakWithFallback(`Pickup set to ${cleaned}. Now, where are you going?`);
      }, 400);
      return;
    }

    // ── DROPOFF step ─────────────────────────────────────────────────────────
    if (cur === VSTATE.DROPOFF) {
      const cleaned = text.replace(/^(to|going to|drop me at|drop me to|destination is|dropoff)\s+/i, "").trim();
      if (!cleaned || cleaned.length < 2) {
        speakWithFallback("I didn't catch that. Please say your destination.");
        return;
      }
      setDropoff(cleaned);
      setVState(VSTATE.CONFIRMING);
      setVStatus("Say confirm to book or cancel");
      const vehicle = vTypeRef.current;
      setTimeout(() => {
        speakWithFallback(
          `Great! Booking a ${vehicle} from ${pickupRef.current || cleaned} to ${cleaned}. Say confirm to book, or cancel to start over.`
        );
      }, 400);
      return;
    }

    // ── CONFIRMING step ──────────────────────────────────────────────────────
    if (cur === VSTATE.CONFIRMING) {
      if (text.includes("yes") || text.includes("confirm") || text.includes("okay") || text.includes("book")) {
        speakWithFallback("Booking your ride now. Please wait.");
        setVState(VSTATE.IDLE);
        setVStatus("Booking…");
        // Trigger the existing confirm handler (needs pickup + dropoff ready in state)
        setTimeout(() => handleConfirmBooking(), 1200);
        return;
      }
      speakWithFallback("Say confirm to book, or cancel to start over.");
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Set up voice recognition for the booking guide ───────────────────────
  useEffect(() => {
    if (!voiceModeActive || !SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    vRecRef.current = rec;

    rec.onstart  = () => setVListening(true);
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setVStatus(`"${t}"`);
      handleVCommand(t);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech") {
        if (!vStopRef.current) { try { rec.start(); } catch (_) {} }
        return;
      }
      setVListening(false);
    };
    rec.onend = () => {
      if (!vStopRef.current) {
        setTimeout(() => { try { rec.start(); } catch (_) {} }, 300);
      } else {
        setVListening(false);
      }
    };

    // Start the guide: announce and begin listening
    vStopRef.current = false;
    setVState(VSTATE.VEHICLE);
    setVStatus("Which vehicle would you like?");
    speakWithFallback("Which vehicle would you like? Car, van, bike, or three wheeler?");
    setTimeout(() => { try { rec.start(); } catch (_) {} }, 1800);

    return () => {
      vStopRef.current = true;
      rec.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceModeActive]);

  // Announce voice pre-fill to user (only when arriving via non-voiceMode pre-fill)
  useEffect(() => {
    if (voiceDestination && !voiceModeActive) {
      const vehicle = voiceVehicle ? ` by ${voiceVehicle}` : "";
      speakWithFallback(
        `Booking page ready. Destination set to ${voiceDestination}${vehicle}. Please confirm your pickup location and tap Book Ride.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Mapbox Refs & State
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const mapInitRef = useRef(false);

  // Route State (pickupCoords is now tracked above with GPS)
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  // Refs that mirror coord state so the route effect can read the latest value
  // without being in its dependency array (which would cause an infinite loop).
  const pickupCoordsRef = useRef(null);
  const dropoffCoordsRef = useRef(null);

  // Track the text for which coordinates were last resolved, so that we know
  // when the user has typed/edited a location and we must re-geocode.
  const lastGeocodedPickupRef = useRef("");
  const lastGeocodedDropoffRef = useRef("");

  // Counter incremented on every swap so the route effect re-runs after a swap
  const [swapTrigger, setSwapTrigger] = useState(0);

  // Keep refs in sync with state
  useEffect(() => { pickupCoordsRef.current = pickupCoords; }, [pickupCoords]);
  useEffect(() => { dropoffCoordsRef.current = dropoffCoords; }, [dropoffCoords]);

  // Resolve GPS location on demand (called by the '📍 Use My Location' button
  // inside LocationInputs). We do NOT auto-run on mount because the browser's
  // IP-based fallback always returns Colombo for Sri Lankan ISPs, which would
  // fill the field with the wrong city for users in Badulla, Kandy, Galle etc.
  const requestGPS = () => {
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
          } else {
            const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            lastGeocodedPickupRef.current = coordsStr;
            setPickup(coordsStr);
          }
        } catch {
          const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          lastGeocodedPickupRef.current = coordsStr;
          setPickup(coordsStr);
        } finally {
          setIsLocating(false);
        }
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (pickup && dropoff) {
      const fetchRoute = async () => {
        try {
          // Strategy: use each side's cached coords as the proximity anchor for
          // geocoding the OTHER side. This ensures that if the user's GPS says
          // they are in Badulla, the dropoff "Udawela" is also resolved near
          // Badulla — not the other "Udawela" 175 km away near Avissawella.

          // Step 1: resolve pickup coords (GPS cache or geocode biased toward dropoff side)
          let pCoords = pickupCoordsRef.current;
          if (!pCoords || pickup !== lastGeocodedPickupRef.current) {
            // Use cached dropoff coords as proximity hint (if available)
            pCoords = await geocodeLocation(pickup, dropoffCoordsRef.current);
            lastGeocodedPickupRef.current = pickup;
            pickupCoordsRef.current = pCoords;
            setPickupCoords(pCoords);
          }

          // Step 2: resolve dropoff coords (biased toward pickup position)
          let dCoords = dropoffCoordsRef.current;
          if (!dCoords || dropoff !== lastGeocodedDropoffRef.current) {
            // Use pickup GPS as proximity hint — critical for local disambiguation
            dCoords = await geocodeLocation(dropoff, pCoords);
            lastGeocodedDropoffRef.current = dropoff;
            dropoffCoordsRef.current = dCoords;
            setDropoffCoords(dCoords);
          }

          if (pCoords && dCoords) {
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
              const distanceKm = parseFloat((shortestRoute.distance / 1000).toFixed(1));
              setDistance(distanceKm > 0 ? distanceKm : 1);
              setRouteGeoJSON(shortestRoute.geometry);
            } else {
              setDistance(1);
              setRouteGeoJSON(null);
            }
          } else {
            setDistance(0);
            setRouteGeoJSON(null);
          }
        } catch (err) {
          console.error("Error calculating distance:", err);
          setDistance(0);
        }
      };

      fetchRoute();
    } else {
      setDistance(0);
      setDropoffCoords(null);
      setRouteGeoJSON(null);
    }
  }, [pickup, dropoff, swapTrigger]);

  // Initialize Map. Runs when user moves to Step 2.
  // IMPORTANT: route/coords may already be resolved in state before the map
  // is created (user typed pickup+dropoff on Step 1 before advancing).
  // We capture those values via closure so the onload callback can draw them
  // immediately rather than waiting for the next state update.
  useEffect(() => {
    if (step !== 2 || !mapContainerRef.current || mapInitRef.current) return;

    mapInitRef.current = true;

    const initialCenter = pickupCoordsRef.current || [COLOMBO_LNG, COLOMBO_LAT];

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: pickupCoordsRef.current ? 14 : 12,
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

  // Update Map Markers and Route Layer whenever coords or route geometry changes.
  useEffect(() => {
    if (!map) return;

    const drawOnMap = () => {
      // --- Markers ---
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();

      if (pickupCoords) {
        pickupMarkerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat(pickupCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p style='font-weight:700;font-size:11px;padding:4px'>Pickup</p>"))
          .addTo(map);
      }
      if (dropoffCoords) {
        dropoffMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat(dropoffCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p style='font-weight:700;font-size:11px;padding:4px'>Drop-off</p>"))
          .addTo(map);
      }

      // --- Fit bounds ---
      if (pickupCoords && dropoffCoords) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropoffCoords);
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }

      // --- Route line ---
      if (routeGeoJSON) {
        const geojsonData = { type: "Feature", geometry: routeGeoJSON };

        if (map.getSource("route")) {
          // Source exists — just update the data
          map.getSource("route").setData(geojsonData);
        } else {
          // First time — add source + layer
          map.addSource("route", { type: "geojson", data: geojsonData });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#0B2F89", "line-width": 5, "line-opacity": 0.85 },
          });
        }
      } else {
        // Route cleared — remove layer and source if they exist
        if (map.getLayer("route")) map.removeLayer("route");
        if (map.getSource("route")) map.removeSource("route");
      }
    };

    if (map.isStyleLoaded()) {
      drawOnMap();
    } else {
      map.once("load", drawOnMap);
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
    // 1. Swap display text
    const tempText = pickup;
    setPickup(dropoff);
    setDropoff(tempText);

    // 2. Swap cached coordinates so the GPS-accurate position follows the text.
    //    Without this, the geocoder re-resolves the place name from text and may
    //    find a completely different place (e.g., wrong "Udawela" → 175 km route).
    const tempCoords = pickupCoordsRef.current;
    const newPickupCoords = dropoffCoordsRef.current;
    const newDropoffCoords = tempCoords;

    // Update refs immediately (before React re-renders) so the route effect
    // triggered by swapTrigger reads the already-swapped values.
    pickupCoordsRef.current = newPickupCoords;
    dropoffCoordsRef.current = newDropoffCoords;
    setPickupCoords(newPickupCoords);
    setDropoffCoords(newDropoffCoords);

    // Swap the lastGeocoded text cache as well to prevent redundant geocoding
    const tempLastGeocoded = lastGeocodedPickupRef.current;
    lastGeocodedPickupRef.current = lastGeocodedDropoffRef.current;
    lastGeocodedDropoffRef.current = tempLastGeocoded;

    // 3. Bump the swap counter to force the route useEffect to re-run
    setSwapTrigger((n) => n + 1);
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

    axios.post(`${API_BASE}/UserDashboard/api/book_ride.php`, payload)
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
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans w-full">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-x-hidden">
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

        {/* Voice Guide Banner — only visible in voiceMode */}
        {voiceModeActive && vState !== VSTATE.IDLE && (
          <div className="mx-4 mb-3 bg-[#0B2F89] text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
            {/* Mic pulse indicator */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${vListening ? "bg-red-500 animate-pulse" : "bg-white/20"}`}>
              {vListening ? <Mic size={16} /> : <MicOff size={16} />}
            </div>
            {/* Step label + status */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {vState === VSTATE.VEHICLE    ? "Step 1 — Choose vehicle"  :
                 vState === VSTATE.PICKUP     ? "Step 2 — Pickup location" :
                 vState === VSTATE.DROPOFF    ? "Step 3 — Destination"     :
                 vState === VSTATE.CONFIRMING ? "Step 4 — Confirm booking" : "Voice Guide"}
              </p>
              <p className="text-xs font-semibold text-white truncate mt-0.5">{vStatus || "Listening…"}</p>
            </div>
            {/* Stop guide button */}
            <button
              onClick={() => {
                vStopRef.current = true;
                vRecRef.current?.abort();
                setVState(VSTATE.IDLE);
                setVListening(false);
                setVStatus("");
              }}
              className="shrink-0 text-white/60 hover:text-white text-xs font-bold cursor-pointer"
              title="Stop voice guide"
            >
              ✕
            </button>
          </div>
        )}

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
                isLocating={isLocating}
                userCoords={pickupCoords}
                onRequestGPS={requestGPS}
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
                {rideClass === "assist" && `Rs. ${rates.assist.toFixed(2)}/km`}
                {rideClass === "auto" && `Rs. ${rates.auto.toFixed(2)}/km`}
                {rideClass === "moto" && `Rs. ${rates.moto.toFixed(2)}/km`}
                {rideClass === "eco" && `Rs. ${rates.eco.toFixed(2)}/km`}
                )
              </span>
              <span className="font-extrabold text-slate-800">
                Rs. {
                  (distance * (
                    rideClass === "assist" ? rates.assist :
                    rideClass === "auto" ? rates.auto :
                    rideClass === "moto" ? rates.moto : rates.eco
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
                    rideClass === "assist" ? rates.assist :
                    rideClass === "auto" ? rates.auto :
                    rideClass === "moto" ? rates.moto : rates.eco
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
    </div>
  );
};

export default BookingPage;
