import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Sparkles, Loader } from "lucide-react";
import API_BASE from "../../../config/api";

// ─── Web Speech API ───────────────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// ─── Global audio singleton (prevents overlap) ────────────────────────────────
let currentAudio = null;
let currentUtterance = null;
let currentAbortController = null;

// ─── Agent backend URL ────────────────────────────────────────────────────────
const AGENT_BASE = `${API_BASE}/voiceassistant/agent.php`;

// ─── Conversation States ──────────────────────────────────────────────────────
const STATE = {
  IDLE: "IDLE",
  WAITING_DESTINATION: "WAITING_DESTINATION",
  CONFIRMING_DESTINATION: "CONFIRMING_DESTINATION",
  WAITING_VEHICLE: "WAITING_VEHICLE",
  CONFIRMING_BOOKING: "CONFIRMING_BOOKING",
  EXECUTING_BOOKING: "EXECUTING_BOOKING",
  WAITING_SOS_CONFIRM: "WAITING_SOS_CONFIRM",
  WAITING_SCHEDULE_DATE: "WAITING_SCHEDULE_DATE",
  WAITING_SCHEDULE_TIME: "WAITING_SCHEDULE_TIME",
};

// ─── Vehicle keyword map ──────────────────────────────────────────────────────
const VEHICLE_KEYWORDS = {
  bike: "bike",
  motorcycle: "bike",
  "three-wheeler": "three-wheeler",
  "three wheeler": "three-wheeler",
  tuk: "three-wheeler",
  "tuk-tuk": "three-wheeler",
  tuktuk: "three-wheeler",
  car: "car",
  sedan: "car",
  van: "van",
};

// ─── Memory helpers ───────────────────────────────────────────────────────────
const Memory = {
  get: (key) => localStorage.getItem(`va_${key}`) || "",
  set: (key, value) => localStorage.setItem(`va_${key}`, value),
  sessionGet: (key) => sessionStorage.getItem(`va_${key}`) || "",
  sessionSet: (key, value) => sessionStorage.setItem(`va_${key}`, value),
  sessionClear: (...keys) =>
    keys.forEach((k) => sessionStorage.removeItem(`va_${k}`)),
};

// ─── TTS: speak text via agent.php (OpenAI TTS with native fallback) ──────────
export const speakWithFallback = async (text, onStart, onEnd) => {
  // Cancel any pending request
  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  // Stop any playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  try {
    const response = await fetch(
      `${AGENT_BASE}?action=speak&text=${encodeURIComponent(text)}`,
      { signal, credentials: 'include' }  // credentials: send session cookie
    );

    const contentType = response.headers.get("content-type") || "";
    if (response.ok && contentType.includes("audio")) {
      const blob = await response.blob();
      if (blob && blob.size > 100) {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;

        if (onStart) onStart();
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (currentAudio === audio) currentAudio = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          if (currentAudio === audio) currentAudio = null;
        };
        try {
          await audio.play();
          return;
        } catch (playErr) {
          URL.revokeObjectURL(url);
          if (currentAudio === audio) currentAudio = null;
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    console.warn("OpenAI TTS unavailable, using browser speech synthesis.");
  }

  // Browser fallback
  if (signal.aborted) return;
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
};

// ─── Fetch user's home location from DB ──────────────────────────────────────
const fetchHomeLocation = async (userId) => {
  try {
    const res = await fetch(
      `${AGENT_BASE}?action=get_user_location&user_id=${userId}`,
      { credentials: 'include' }  // credentials: send session cookie for auth
    );
    const data = await res.json();
    if (data.success) return data.location;
  } catch (e) {
    console.warn("Failed to fetch home location:", e);
  }
  return null;
};

// ─── Fetch last ride from DB ──────────────────────────────────────────────────
const fetchLastRide = async (userId) => {
  try {
    const res = await fetch(
      `${AGENT_BASE}?action=get_last_ride&user_id=${userId}`,
      { credentials: 'include' }  // credentials: send session cookie for auth
    );
    const data = await res.json();
    if (data.success) return data;
  } catch (e) {
    console.warn("Failed to fetch last ride:", e);
  }
  return null;
};

// ─── Fetch Active Ride OTP for user ──────────────────────────────────────────
const fetchActiveRideOtp = async (userId) => {
  try {
    const res = await fetch(`${API_BASE}/UserDashboard/api/active_ride.php?user_id=${userId}`);
    const json = await res.json();
    if (json.success && json.data && json.data.id) {
      const rideId = json.data.id;
      const otp = ((rideId * 127 + 3571) % 9000) + 1000;
      return {
        otp: otp.toString(),
        spokenOtp: otp.toString().split("").join(", "),
        driverName: json.data.driver_name || "your driver",
        vehicleNumber: json.data.driver_vehicle_number || ""
      };
    }
  } catch (e) {
    console.warn("Failed to fetch active ride OTP:", e);
  }
  return null;
};

// ─── Match vehicle keyword from spoken text ───────────────────────────────────
const matchVehicle = (text) => {
  for (const [keyword, type] of Object.entries(VEHICLE_KEYWORDS)) {
    if (text.includes(keyword)) return type;
  }
  return null;
};

// ─── Resolve spoken destination to exact Mapbox location ───────────────────────
const resolveMapboxDestination = async (query) => {
  if (!query || query.trim().length < 2) return null;
  const token = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const proxLng = 79.8612;
  const proxLat = 6.9271; // Colombo default proximity

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${token}&country=lk&proximity=${proxLng},${proxLat}&types=poi,address,neighborhood,locality,place&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.features && data.features.length > 0) {
      const top = data.features[0];
      return {
        placeName: top.place_name,
        shortName: top.text || top.place_name,
        coordinates: top.geometry.coordinates, // [lng, lat]
      };
    }
  } catch (err) {
    console.warn("Mapbox destination lookup error:", err);
  }
  return null;
};

// ─── Main VoiceAssistant Component (Always On for Blind Users) ───────────────────
export const VoiceAssistantButton = ({
  pageName = "Dashboard",
  welcomePrompt = "",
  floating = false,
}) => {
  const navigate = useNavigate();

  const [agentState, setAgentState] = useState(STATE.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Listening for voice commands…");

  const recognitionRef = useRef(null);
  const agentStateRef = useRef(STATE.IDLE); // always up-to-date in callbacks
  const manualStopRef = useRef(false);      // ALWAYS ON by default for blind users
  const isListeningRef = useRef(false);     // track if recognition is currently active
  const isSpeakingRef = useRef(false);      // track if TTS is currently speaking
  const handleCommandRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState]);

  const userId =
    sessionStorage.getItem("user_id") ||
    "0";

  // ── Speak helper that pauses mic while speaking then resumes ───────────────
  const speak = useCallback((text) => {
    setStatusText(text.length > 50 ? text.slice(0, 47) + "…" : text);
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    // Temporarily pause recognition so mic doesn't hear computer speaker
    if (recognitionRef.current && isListeningRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    speakWithFallback(
      text,
      null,
      () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        // Resume listening after TTS finishes
        if (!manualStopRef.current && recognitionRef.current && !isListeningRef.current) {
          setTimeout(() => {
            if (!manualStopRef.current && !isSpeakingRef.current && !isListeningRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch (_) {}
            }
          }, 200);
        }
      }
    );
  }, []);

  // ── Transition state helper ───────────────────────────────────────────────
  const transition = useCallback((newState, statusMsg = "") => {
    setAgentState(newState);
    agentStateRef.current = newState;
    if (statusMsg) setStatusText(statusMsg);
  }, []);

  // ── Reset to idle ─────────────────────────────────────────────────────────
  const resetToIdle = useCallback(() => {
    Memory.sessionClear("pending_destination", "pending_vehicle", "pending_date");
    transition(STATE.IDLE, "Listening for voice commands…");
  }, [transition]);

  // ── Play welcome prompt on page mount ─────────────────────────────────────
  useEffect(() => {
    if (welcomePrompt) {
      const timer = setTimeout(() => speak(welcomePrompt), 600);
      return () => clearTimeout(timer);
    }
  }, [welcomePrompt, speak]);

  // ── Core command handler (state machine) ──────────────────────────────────
  const handleCommand = useCallback(
    async (rawText) => {
      const text = rawText.toLowerCase().trim();
      const currentState = agentStateRef.current;

      console.log(`[Agent] State: ${currentState} | Input: "${text}"`);

      // ── CANCEL — works from any state ──────────────────────────────────
      if (
        text.includes("cancel") ||
        text.includes("never mind") ||
        text.includes("stop") ||
        text.includes("nevermind")
      ) {
        speak("Okay, cancelled. How can I help you?");
        resetToIdle();
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: IDLE — entry point for all new commands
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.IDLE) {

        // ── SOS / EMERGENCY ────────────────────────────────────────────
        if (
          text.includes("sos") ||
          text.includes("emergency") ||
          (text.includes("help") && !text.includes("help me book") && !text.includes("what can you do") && !text.includes("commands"))
        ) {
          speak(
            "SOS detected. Say YES to confirm emergency, or say cancel."
          );
          transition(STATE.WAITING_SOS_CONFIRM, "Say YES to confirm SOS…");
          return;
        }

        // ── SAME AS LAST TIME ──────────────────────────────────────────
        if (
          text.includes("same as last time") ||
          text.includes("same ride") ||
          text.includes("book again") ||
          text.includes("rebook")
        ) {
          // 1. Check localStorage first (fastest)
          const lastDest = Memory.get("last_destination");
          const lastVehicle = Memory.get("last_vehicle");

          if (lastDest) {
            Memory.sessionSet("pending_destination", lastDest);
            if (lastVehicle) {
              Memory.sessionSet("pending_vehicle", lastVehicle);
              speak(
                `Last time you went to ${lastDest} by ${lastVehicle}. Shall I book the same? Say yes or cancel.`
              );
              transition(STATE.CONFIRMING_BOOKING, `Confirm: ${lastDest} by ${lastVehicle}`);
            } else {
              speak(
                `Last destination was ${lastDest}. Which vehicle? Bike, three-wheeler, car, or van?`
              );
              transition(STATE.WAITING_VEHICLE, "Which vehicle?");
            }
            return;
          }

          // 2. Fallback: fetch from DB
          speak("Checking your ride history…");
          const lastRide = await fetchLastRide(userId);
          if (lastRide) {
            Memory.sessionSet("pending_destination", lastRide.destination);
            Memory.set("last_destination", lastRide.destination);
            if (lastRide.vehicle_type) {
              Memory.sessionSet("pending_vehicle", lastRide.vehicle_type);
              Memory.set("last_vehicle", lastRide.vehicle_type);
              speak(
                `Last time you went to ${lastRide.destination} by ${lastRide.vehicle_type}. Shall I book the same? Say yes or cancel.`
              );
              transition(STATE.CONFIRMING_BOOKING, `Confirm: ${lastRide.destination}`);
            } else {
              speak(
                `Last destination was ${lastRide.destination}. Which vehicle? Bike, three-wheeler, car, or van?`
              );
              transition(STATE.WAITING_VEHICLE, "Which vehicle?");
            }
          } else {
            speak(
              "I couldn't find a previous ride. Please tell me where you'd like to go."
            );
            transition(STATE.WAITING_DESTINATION, "Where to?");
          }
          return;
        }

        // ── TAKE ME HOME ───────────────────────────────────────────────
        if (
          text.includes("take me home") ||
          (text.includes("go home") && text.includes("ride")) ||
          text.includes("book to home")
        ) {
          speak("Looking up your home address…");
          const homeLocation = await fetchHomeLocation(userId);
          if (homeLocation) {
            Memory.sessionSet("pending_destination", homeLocation);
            speak(
              `Taking you home to ${homeLocation}. Which vehicle? Bike, three-wheeler, car, or van?`
            );
            transition(STATE.WAITING_VEHICLE, "Which vehicle?");
          } else {
            speak(
              "I couldn't find your home address. Please make sure your profile location is set."
            );
            resetToIdle();
          }
          return;
        }

        // ── BOOK A RIDE / BOOK IT / VEHICLE STEP ──────────────────────
        if (
          text.includes("book") ||
          text.includes("i want a ride") ||
          text.includes("i need a ride") ||
          text.includes("get me a ride") ||
          text.includes("new ride") ||
          text.includes("vehicle")
        ) {
          const toMatch = text.match(/(?:to|for|going to|drop me at|drop me to|i want to go to)\s+(.+)/i);
          if (toMatch && toMatch[1].trim().length > 1) {
            const rawDest = toMatch[1].trim();
            speak(`Looking up ${rawDest} on Mapbox…`);
            const resolved = await resolveMapboxDestination(rawDest);
            const finalDest = resolved ? resolved.placeName : rawDest;
            const displayName = resolved ? resolved.shortName : rawDest;

            Memory.sessionSet("pending_destination", finalDest);
            if (resolved?.coordinates) {
              Memory.sessionSet("pending_dropoff_coords", JSON.stringify(resolved.coordinates));
            }
            speak(
              `Found ${displayName}. Opening booking page to choose vehicle.`
            );
            setTimeout(() => {
              navigate("/user/booking", {
                state: { voiceMode: true, voiceDestination: finalDest, step: 1 },
              });
            }, 1000);
            resetToIdle();
            return;
          }

          speak("Opening booking page. Which vehicle would you like? Car, van, bike, or three wheeler?");
          navigate("/user/booking", { state: { voiceMode: true, step: 1 } });
          resetToIdle();
          return;
        }

        // ── SHOW SCHEDULE LIST / READ SCHEDULES ────────────────────────
        if (
          text.includes("schedule list") ||
          text.includes("my schedule") ||
          text.includes("my schedules") ||
          text.includes("show schedule") ||
          text.includes("show my schedule") ||
          text.includes("read my schedule") ||
          text.includes("read schedule") ||
          text.includes("list schedule") ||
          text.includes("scheduled rides") ||
          text.includes("scheduled trips") ||
          text.includes("view schedule")
        ) {
          speak("Opening your schedule list.");
          navigate("/user/schedule", { state: { activeTab: "list", readSchedules: true } });
          resetToIdle();
          return;
        }

        // ── SCHEDULE A RIDE ────────────────────────────────────────────
        if (
          text.includes("schedule") ||
          text.includes("later") ||
          text.includes("tomorrow") ||
          text.includes("future ride") ||
          text.includes("plan ride") ||
          text.includes("book advance")
        ) {
          const toMatch = text.match(/(?:to|for|going to|drop me at|drop me to|i want to go to)\s+(.+)/i);
          if (toMatch && toMatch[1].trim().length > 1) {
            const rawDest = toMatch[1].trim();
            speak(`Looking up ${rawDest} on Mapbox…`);
            const resolved = await resolveMapboxDestination(rawDest);
            const finalDest = resolved ? resolved.placeName : rawDest;
            const displayName = resolved ? resolved.shortName : rawDest;

            speak(`I found ${displayName}. Opening schedule ride to choose vehicle and confirm.`);
            setTimeout(() => {
              navigate("/user/schedule", {
                state: { activeTab: "form", voiceMode: true, voiceDestination: finalDest, step: 1 }
              });
            }, 1000);
            resetToIdle();
            return;
          }

          speak("Opening schedule ride. Which vehicle would you like? Car, van, bike, or three wheeler?");
          navigate("/user/schedule", { state: { activeTab: "form", voiceMode: true, step: 1 } });
          resetToIdle();
          return;
        }

        // ── TRACK DRIVER / RIDE STATUS ─────────────────────────────────
        if (
          text.includes("track") ||
          text.includes("where is my driver") ||
          text.includes("driver location") ||
          text.includes("where is the driver") ||
          text.includes("ride status") ||
          text.includes("current ride") ||
          text.includes("active ride")
        ) {
          speak("Opening live ride tracking.");
          navigate("/user/ride");
          resetToIdle();
          return;
        }

        // ── TELL THE OTP / RIDE CONFIRMATION PIN ───────────────────────
        if (
          text.includes("otp") ||
          text.includes("pin") ||
          text.includes("code") ||
          text.includes("passcode") ||
          text.includes("confirm code") ||
          text.includes("tell the otp") ||
          text.includes("ride code")
        ) {
          speak("Checking your active ride OTP…");
          const otpData = await fetchActiveRideOtp(userId);
          if (otpData) {
            speak(
              `Your ride confirmation OTP is ${otpData.spokenOtp}. Please share this 4 digit code with your driver to start your ride.`
            );
          } else {
            speak("You do not have an active ride at the moment. Say book a ride to request a trip.");
          }
          return;
        }

        // ── MY RIDES / RIDE HISTORY ────────────────────────────────────
        if (
          text.includes("history") ||
          text.includes("my ride") ||
          text.includes("my rides") ||
          text.includes("previous ride") ||
          text.includes("previous rides") ||
          text.includes("past ride") ||
          text.includes("past rides") ||
          text.includes("my trip") ||
          text.includes("my trips") ||
          text.includes("trips")
        ) {
          speak("Opening your ride history.");
          navigate("/user/history");
          resetToIdle();
          return;
        }

        // ── NOTIFICATIONS ──────────────────────────────────────────────
        if (
          text.includes("notification") ||
          text.includes("notifications") ||
          text.includes("alerts") ||
          text.includes("messages") ||
          text.includes("inbox")
        ) {
          speak("Opening your notifications.");
          navigate("/user/notifications");
          resetToIdle();
          return;
        }

        // ── PROFILE & SETTINGS ─────────────────────────────────────────
        if (
          text.includes("profile") ||
          text.includes("account") ||
          text.includes("my profile") ||
          text.includes("my account") ||
          text.includes("settings")
        ) {
          speak("Opening your profile settings.");
          navigate("/user/profile");
          resetToIdle();
          return;
        }

        // ── EMERGENCY SOS ──────────────────────────────────────────────
        if (
          text.includes("sos") ||
          text.includes("emergency") ||
          text.includes("help me") ||
          text.includes("police") ||
          text.includes("danger")
        ) {
          speak("Opening emergency SOS screen.");
          navigate("/user/sos");
          resetToIdle();
          return;
        }

        // ── DASHBOARD / HOME (navigation, not ride) ────────────────────
        if (
          text.includes("go home") ||
          text.includes("dashboard") ||
          text.includes("main menu") ||
          text.includes("home page") ||
          text.includes("home")
        ) {
          speak("Heading back to the dashboard.");
          navigate("/user/dashboard");
          resetToIdle();
          return;
        }

        // ── WHERE AM I / SCREEN INFO ────────────────────────────────────
        if (text.includes("where am i") || text.includes("current page") || text.includes("what screen")) {
          speak(
            `You are currently on the ${pageName} screen. You can say: Book a ride, Take me home, Schedule a ride, Track driver, History, Profile, or SOS.`
          );
          return;
        }

        // ── HELP ───────────────────────────────────────────────────────
        if (text.includes("help") || text.includes("what can you do") || text.includes("commands")) {
          speak(
            "I am always listening to help you. You can say: Book a ride, Take me home, Same as last time, Schedule a ride, Track driver, History, Notifications, Profile, or SOS."
          );
          return;
        }

        // ── UNRECOGNIZED ───────────────────────────────────────────────
        speak(
          "I am listening. Say book a ride, take me home, track driver, or help."
        );
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_DESTINATION
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_DESTINATION) {
        // Strip leading filler words
        const cleaned = text
          .replace(/^(to|going to|i want to go to|drop me at|drop me to|take me to|take me)\s+/i, "")
          .trim();

        if (!cleaned || cleaned.length < 2) {
          speak("I didn't catch that. Please say the destination name.");
          return;
        }

        speak(`Looking up ${cleaned} on Mapbox…`);

        const resolved = await resolveMapboxDestination(cleaned);
        const finalDest = resolved ? resolved.placeName : cleaned;
        const displayName = resolved ? resolved.shortName : cleaned;

        Memory.sessionSet("pending_destination", finalDest);
        if (resolved?.coordinates) {
          Memory.sessionSet("pending_dropoff_coords", JSON.stringify(resolved.coordinates));
        }

        speak(
          `I found ${displayName}. Is this your destination? Say yes to continue, or tell me your destination again.`
        );
        transition(STATE.CONFIRMING_DESTINATION, `Destination: ${displayName}?`);
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: CONFIRMING_DESTINATION
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.CONFIRMING_DESTINATION) {
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
          speak("Great! Which vehicle would you like? Bike, three-wheeler, car, or van?");
          transition(STATE.WAITING_VEHICLE, "Which vehicle?");
          return;
        }

        // If the user says "no" or provides a new destination directly
        const cleaned = text
          .replace(/^(no|not this|wrong|change|different|to|going to|take me to)\s+/i, "")
          .trim();

        if (!cleaned || cleaned === "no" || cleaned.length < 2) {
          speak("Okay, please tell me your destination again.");
          transition(STATE.WAITING_DESTINATION, "Where to?");
          return;
        }

        // User spoke a new destination name directly (e.g. "Majestic City" or "No, Colombo Fort")
        speak(`Looking up ${cleaned} on Mapbox…`);
        const resolved = await resolveMapboxDestination(cleaned);
        const finalDest = resolved ? resolved.placeName : cleaned;
        const displayName = resolved ? resolved.shortName : cleaned;

        Memory.sessionSet("pending_destination", finalDest);
        if (resolved?.coordinates) {
          Memory.sessionSet("pending_dropoff_coords", JSON.stringify(resolved.coordinates));
        }

        speak(
          `I found ${displayName}. Is this your destination? Say yes to continue, or tell me your destination again.`
        );
        transition(STATE.CONFIRMING_DESTINATION, `Destination: ${displayName}?`);
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_VEHICLE
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_VEHICLE) {
        const vehicle = matchVehicle(text);

        if (!vehicle) {
          speak("Please say bike, three-wheeler, car, or van.");
          return;
        }

        const dest = Memory.sessionGet("pending_destination");
        Memory.sessionSet("pending_vehicle", vehicle);

        speak(
          `You've selected a ${vehicle} to ${dest}. Shall I confirm this ride? Say yes or cancel.`
        );
        transition(
          STATE.CONFIRMING_BOOKING,
          `Confirm: ${vehicle} to ${dest}?`
        );
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: CONFIRMING_BOOKING
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.CONFIRMING_BOOKING) {
        if (
          text.includes("yes") ||
          text.includes("confirm") ||
          text.includes("book") ||
          text.includes("sure") ||
          text.includes("okay") ||
          text.includes("ok")
        ) {
          const dest = Memory.sessionGet("pending_destination");
          const vehicle = Memory.sessionGet("pending_vehicle") || "car";

          transition(STATE.EXECUTING_BOOKING, "Booking ride…");
          speak("Booking your ride now. Please wait a moment.");

          try {
            const userLat = sessionStorage.getItem("user_latitude") || "6.9271";
            const userLng = sessionStorage.getItem("user_longitude") || "79.8612";
            const pickupName =
              sessionStorage.getItem("user_location_name") || "Current Location";

            const res = await fetch(`${API_BASE}/UserDashboard/api/book_ride.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                user_id: parseInt(userId, 10),
                pickup_location: pickupName,
                dropoff_location: dest,
                pickup_lat: parseFloat(userLat),
                pickup_lng: parseFloat(userLng),
                vehicle_type: vehicle,
                payment_method: "cash",
                notes: "Voice booked ride for blind passenger",
              }),
            });

            const data = await res.json();

            if (data.status === "success" || data.success) {
              Memory.set("last_destination", dest);
              Memory.set("last_vehicle", vehicle);
              Memory.sessionClear("pending_destination", "pending_vehicle");

              speak(
                `Your ${vehicle} to ${dest} is booked! Finding a driver for you. Opening live ride tracking.`
              );
              transition(STATE.IDLE);
              navigate("/user/ride", {
                state: { rideId: data.ride_id, autoTracking: true },
              });
            } else {
              speak(
                `Could not book the ride: ${data.message || "Unknown error"}. Opening booking page.`
              );
              navigate("/user/booking", {
                state: { voiceMode: true, pendingDest: dest, pendingVehicle: vehicle },
              });
              resetToIdle();
            }
          } catch (e) {
            console.error("Booking failed:", e);
            speak("There was a connection problem. Opening the booking page for you.");
            navigate("/user/booking", {
              state: { voiceMode: true, pendingDest: dest, pendingVehicle: vehicle },
            });
            resetToIdle();
          }
          return;
        }

        // Did not say yes → treat as cancel
        speak("Booking cancelled. How else can I help you?");
        resetToIdle();
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_SOS_CONFIRM
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_SOS_CONFIRM) {
        if (text.includes("yes") || text.includes("confirm") || text.includes("help")) {
          speak("SOS activated. Help is being contacted. Stay calm.");
          transition(STATE.IDLE);
          navigate("/user/sos");
          return;
        }

        // Any other response → cancel
        speak("SOS cancelled. You're safe. How can I help you?");
        resetToIdle();
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_SCHEDULE_DATE
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_SCHEDULE_DATE) {
        Memory.sessionSet("pending_date", text);
        speak(`${text}. What time should I schedule the ride?`);
        transition(STATE.WAITING_SCHEDULE_TIME, "What time?");
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_SCHEDULE_TIME
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_SCHEDULE_TIME) {
        const date = Memory.sessionGet("pending_date");
        speak(
          `Got it. Opening the schedule page for ${date} at ${text}.`
        );
        navigate("/user/schedule", {
          state: { voiceDate: date, voiceTime: text },
        });
        resetToIdle();
        return;
      }
    },
    [navigate, speak, transition, resetToIdle, userId, pageName]
  );

  useEffect(() => {
    handleCommandRef.current = handleCommand;
  }, [handleCommand]);

  // ── Set up Web Speech Recognition (Always-On Engine) ──────────────────────
  useEffect(() => {
    if (!SpeechRecognition) {
      setStatusText("Voice recognition not supported in this browser");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true; // Keep mic stream alive continuously without flapping
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setStatusText("Listening…");
    };

    rec.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      setStatusText(`"${transcript}"`);
      handleCommandRef.current?.(transcript);
    };

    rec.onerror = (event) => {
      // 'no-speech' and 'aborted' are normal lifecycle events — ignore in continuous mode
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.warn("Speech recognition notice:", event.error);
    };

    rec.onend = () => {
      isListeningRef.current = false;
      // Auto-restart mic unless the user manually stopped or assistant is speaking
      if (!manualStopRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!manualStopRef.current && !isSpeakingRef.current && !isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        }, 300);
      } else if (manualStopRef.current) {
        setIsListening(false);
        setStatusText(
          agentStateRef.current === STATE.IDLE ? "Tap to speak" : statusText
        );
      }
    };

    recognitionRef.current = rec;
    manualStopRef.current = false;

    // Start listening immediately on mount
    try {
      rec.start();
    } catch (_) {}

    // Auto-unlock mic on first user interaction if browser enforces autoplay policy
    const autoUnlock = () => {
      if (!manualStopRef.current && !isSpeakingRef.current && !isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    };
    window.addEventListener("click", autoUnlock, { once: true });
    window.addEventListener("touchstart", autoUnlock, { once: true });

    return () => {
      window.removeEventListener("click", autoUnlock);
      window.removeEventListener("touchstart", autoUnlock);
      manualStopRef.current = true;
      isListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (isListeningRef.current) {
      manualStopRef.current = true;
      isListeningRef.current = false;
      setIsListening(false);
      try { recognitionRef.current.stop(); } catch (_) {}
    } else {
      manualStopRef.current = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (!isListeningRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const isWaitingForInput =
    agentState !== STATE.IDLE && agentState !== STATE.EXECUTING_BOOKING;

  // ── Floating Button Design ─────────────────────────────────────────────
  if (floating) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 select-none pointer-events-auto">
        {/* Status Bubble */}
        {(isListening || isWaitingForInput || isSpeaking) && (
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl px-3 py-1.5 rounded-2xl max-w-[200px] text-right animate-fade-in">
            <p className="text-[11px] font-bold text-[#0B2F89] truncate">
              {isSpeaking ? "Speaking…" : statusText}
            </p>
          </div>
        )}

        {/* Floating Mic Button */}
        <button
          onClick={toggleListen}
          disabled={agentState === STATE.EXECUTING_BOOKING}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-400
            ${isListening
              ? "bg-red-500 border-red-200 text-white animate-pulse scale-105"
              : isWaitingForInput
              ? "bg-[#0B2F89] border-blue-200 text-white hover:scale-105"
              : agentState === STATE.EXECUTING_BOOKING
              ? "bg-slate-300 border-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-[#FEC329] border-white text-slate-900 hover:scale-105 shadow-yellow-500/30"
            }`}
          aria-label={isListening ? "Voice Assistant Listening" : "Start Voice Assistant"}
        >
          {agentState === STATE.EXECUTING_BOOKING ? (
            <Loader size={22} className="animate-spin" />
          ) : isListening ? (
            <Mic size={22} className="animate-pulse" />
          ) : (
            <MicOff size={22} />
          )}
        </button>
      </div>
    );
  }

  // ── Original Classic Card Design ─────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles
          size={15}
          className={`text-yellow-500 ${isSpeaking ? "animate-spin" : "animate-pulse"}`}
        />
        <h4 className="text-xs font-black text-[#0B2F89] uppercase tracking-widest">
          {pageName} Assistant
        </h4>
      </div>

      {/* Mic Button */}
      <button
        onClick={toggleListen}
        disabled={agentState === STATE.EXECUTING_BOOKING}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-400
          ${isListening
            ? "bg-red-500 border-red-200 text-white animate-pulse scale-105"
            : isWaitingForInput
            ? "bg-[#0B2F89] border-blue-200 text-white hover:scale-105"
            : agentState === STATE.EXECUTING_BOOKING
            ? "bg-slate-300 border-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-yellow-400 border-white text-[#0B2F89] hover:scale-105"
          }`}
        aria-label={isListening ? "Tap to stop mic" : "Tap to start mic"}
      >
        {agentState === STATE.EXECUTING_BOOKING ? (
          <Loader size={30} className="animate-spin" />
        ) : isListening ? (
          <Mic size={30} className="animate-pulse" />
        ) : (
          <MicOff size={30} />
        )}
      </button>

      {/* State badge — shown when in a multi-turn flow */}
      {isWaitingForInput && !isListening && (
        <div className="mt-3 px-3 py-1 bg-[#0B2F89]/10 rounded-full">
          <span className="text-xs font-bold text-[#0B2F89]">
            {agentState === STATE.WAITING_SOS_CONFIRM
              ? "⚠ Confirm SOS"
              : agentState === STATE.WAITING_DESTINATION
              ? "🗺 Where to?"
              : agentState === STATE.WAITING_VEHICLE
              ? "🚗 Choose vehicle"
              : agentState === STATE.CONFIRMING_BOOKING
              ? "✅ Confirm booking"
              : agentState === STATE.WAITING_SCHEDULE_DATE
              ? "📅 Which date?"
              : agentState === STATE.WAITING_SCHEDULE_TIME
              ? "🕐 What time?"
              : "Listening…"}
          </span>
        </div>
      )}

      {/* Status text */}
      <p className="mt-3 text-xs font-semibold text-slate-500 animate-pulse text-center max-w-[200px] leading-relaxed">
        {isListening
          ? "Always listening — tap to stop"
          : statusText}
      </p>
    </div>
  );
};
