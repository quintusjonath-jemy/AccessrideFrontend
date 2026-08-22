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

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;

      if (onStart) onStart();
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (currentAudio === audio) currentAudio = null;
        if (onEnd) onEnd();
      };
      await audio.play();
      return;
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

// ─── Match vehicle keyword from spoken text ───────────────────────────────────
const matchVehicle = (text) => {
  for (const [keyword, type] of Object.entries(VEHICLE_KEYWORDS)) {
    if (text.includes(keyword)) return type;
  }
  return null;
};

// ─── Main VoiceAssistantButton component ─────────────────────────────────────
export const VoiceAssistantButton = ({
  pageName = "Dashboard",
  welcomePrompt = "",
}) => {
  const navigate = useNavigate();

  const [agentState, setAgentState] = useState(STATE.IDLE);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Tap to speak");

  const recognitionRef = useRef(null);
  const agentStateRef = useRef(STATE.IDLE); // always up-to-date in callbacks
  const manualStopRef = useRef(true);       // true by default; set false when user taps mic

  // Keep ref in sync with state
  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState]);

  const userId =
    localStorage.getItem("user_id") ||
    sessionStorage.getItem("user_id") ||
    "0";

  // ── Speak helper that pauses mic while speaking then resumes ───────────────
  const speak = useCallback((text) => {
    setStatusText(text.length > 50 ? text.slice(0, 47) + "…" : text);
    // Pause recognition while assistant speaks so mic doesn't hear computer speaker
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    speakWithFallback(
      text,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        // Resume listening after TTS finishes if user hasn't manually stopped
        if (!manualStopRef.current && recognitionRef.current) {
          setTimeout(() => {
            try { recognitionRef.current.start(); } catch (_) {}
          }, 300);
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
    transition(STATE.IDLE, "Tap to speak");
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
          (text.includes("help") && !text.includes("help me book"))
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
          text.includes("book again")
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
          text.includes("go home") && text.includes("ride") ||
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

        // ── BOOK A RIDE / BOOK IT ──────────────────────────────────────
        if (
          text.includes("book") ||
          text.includes("i want a ride") ||
          text.includes("i need a ride") ||
          text.includes("get me a ride") ||
          text.includes("ride")
        ) {
          manualStopRef.current = true;
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (_) {}
          }
          speak("Opening booking page. Please choose your vehicle.");
          setTimeout(() =>
            navigate("/user/booking", { state: { voiceMode: true } })
          , 1000);
          resetToIdle();
          return;
        }

        // ── SCHEDULE A RIDE ────────────────────────────────────────────
        if (text.includes("schedule") || text.includes("later") || text.includes("tomorrow")) {
          speak("Sure, let's schedule a ride. What date? For example, say today, tomorrow, or a specific date.");
          transition(STATE.WAITING_SCHEDULE_DATE, "Which date?");
          return;
        }

        // ── TRACK DRIVER ───────────────────────────────────────────────
        if (
          text.includes("track") ||
          text.includes("where is my driver") ||
          text.includes("driver location") ||
          text.includes("where is the driver")
        ) {
          speak("Opening live ride tracking.");
          navigate("/user/ride");
          resetToIdle();
          return;
        }

        // ── HISTORY ────────────────────────────────────────────────────
        if (
          text.includes("history") ||
          text.includes("my rides") ||
          text.includes("previous rides") ||
          text.includes("past rides")
        ) {
          speak("Opening your ride history.");
          navigate("/user/history");
          resetToIdle();
          return;
        }

        // ── NOTIFICATIONS ──────────────────────────────────────────────
        if (text.includes("notification") || text.includes("alerts") || text.includes("messages")) {
          speak("Opening your notifications.");
          navigate("/user/notifications");
          resetToIdle();
          return;
        }

        // ── PROFILE ────────────────────────────────────────────────────
        if (text.includes("profile") || text.includes("account") || text.includes("settings")) {
          speak("Opening your profile settings.");
          navigate("/user/profile");
          resetToIdle();
          return;
        }

        // ── DASHBOARD / HOME (navigation, not ride) ────────────────────
        if (
          (text.includes("go home") || text.includes("dashboard") || text.includes("main menu")) &&
          !text.includes("ride")
        ) {
          speak("Heading back to the dashboard.");
          navigate("/user/dashboard");
          resetToIdle();
          return;
        }

        // ── HELP ───────────────────────────────────────────────────────
        if (text.includes("help") || text.includes("what can you do") || text.includes("commands")) {
          speak(
            "I can help you with: Book a ride, Take me home, Same as last time, Schedule a ride, Track my driver, View history, Notifications, Profile, and SOS."
          );
          return;
        }

        // ── UNRECOGNIZED ───────────────────────────────────────────────
        speak(
          "Sorry, I didn't catch that. Say help to hear what I can do."
        );
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_DESTINATION
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_DESTINATION) {
        // Strip leading filler words
        const cleaned = text
          .replace(/^(to|going to|i want to go to|drop me at|take me to)\s+/i, "")
          .trim();

        if (!cleaned || cleaned.length < 2) {
          speak("I didn't catch that. Please say the destination name.");
          return;
        }

        Memory.sessionSet("pending_destination", cleaned);
        speak(
          `${cleaned}. Which vehicle would you like? Bike, three-wheeler, car, or van?`
        );
        transition(STATE.WAITING_VEHICLE, "Which vehicle?");
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: WAITING_VEHICLE
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.WAITING_VEHICLE) {
        const vehicle = matchVehicle(text);

        if (!vehicle) {
          speak(
            "I didn't catch the vehicle type. Please say bike, three-wheeler, car, or van."
          );
          return;
        }

        const destination = Memory.sessionGet("pending_destination");
        Memory.sessionSet("pending_vehicle", vehicle);
        speak(
          `Booking a ${vehicle} to ${destination}. Say yes to confirm or cancel.`
        );
        transition(
          STATE.CONFIRMING_BOOKING,
          `Confirm: ${vehicle} to ${destination}`
        );
        return;
      }

      // ══════════════════════════════════════════════════════════════════
      // STATE: CONFIRMING_BOOKING
      // ══════════════════════════════════════════════════════════════════
      if (currentState === STATE.CONFIRMING_BOOKING) {

        if (text.includes("yes") || text.includes("confirm") || text.includes("okay") || text.includes("ok") || text.includes("sure")) {
          const destination = Memory.sessionGet("pending_destination");
          const vehicle = Memory.sessionGet("pending_vehicle");

          // Save to persistent memory
          Memory.set("last_destination", destination);
          Memory.set("last_vehicle", vehicle);

          speak(`Great! Booking your ${vehicle} to ${destination}. Please wait.`);
          transition(STATE.EXECUTING_BOOKING, "Booking your ride…");

          // Navigate to booking page with voice pre-fill state
          setTimeout(() => {
            navigate("/user/booking", {
              state: {
                voiceDestination: destination,
                voiceVehicle: vehicle,
              },
            });
            resetToIdle();
          }, 1800);
          return;
        }

        if (text.includes("change vehicle") || text.includes("different vehicle") || text.includes("change car")) {
          speak("Sure, which vehicle? Bike, three-wheeler, car, or van?");
          transition(STATE.WAITING_VEHICLE, "Which vehicle?");
          return;
        }

        if (text.includes("change destination") || text.includes("different place") || text.includes("change location")) {
          speak("Okay, where would you like to go?");
          transition(STATE.WAITING_DESTINATION, "Where to?");
          return;
        }

        speak("Say yes to confirm, or cancel to start over.");
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
    [navigate, speak, transition, resetToIdle, userId]
  );

  // ── Set up Web Speech Recognition ─────────────────────────────────────────
  useEffect(() => {
    if (!SpeechRecognition) {
      setStatusText("Voice not supported in this browser");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    // continuous = true would cause issues in some browsers; instead we
    // auto-restart in onend so the mic stays on after each utterance.

    rec.onstart = () => {
      setIsListening(true);
      setStatusText("Listening…");
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setStatusText(`"${transcript}"`);
      handleCommand(transcript);
    };

    rec.onerror = (event) => {
      // 'no-speech' is normal — just restart quietly
      if (event.error === "no-speech") {
        if (!manualStopRef.current) {
          try { rec.start(); } catch (_) {}
        }
        return;
      }
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      setStatusText("Mic error. Tap to try again.");
    };

    rec.onend = () => {
      // Auto-restart mic unless the user manually tapped to stop
      if (!manualStopRef.current) {
        // Small delay so TTS can start before we listen again
        setTimeout(() => {
          try {
            rec.start();
          } catch (_) {
            // Already running — ignore
          }
        }, 300);
      } else {
        // User tapped stop — stay off
        setIsListening(false);
        setStatusText(
          agentStateRef.current === STATE.IDLE ? "Tap to speak" : statusText
        );
      }
    };

    recognitionRef.current = rec;
    return () => {
      manualStopRef.current = true;
      recognitionRef.current?.abort();
    };
  }, [handleCommand]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      // User wants to stop — set flag so onend doesn't restart
      manualStopRef.current = true;
      recognitionRef.current.stop();
    } else {
      // User wants to start — clear flag so onend auto-restarts
      manualStopRef.current = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  // ── Derived button style ──────────────────────────────────────────────────
  const isWaitingForInput = agentState !== STATE.IDLE && agentState !== STATE.EXECUTING_BOOKING;

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
