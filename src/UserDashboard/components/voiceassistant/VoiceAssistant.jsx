import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";

// Web Speech API interfaces
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Global single instance to prevent voice overlapping and garbage collection
let currentAudio = null;
let currentUtterance = null;
let currentAbortController = null;

// Helper to speak using OpenAI TTS (with native Web Speech fallback if OpenAI key is missing)
export const speakWithFallback = async (text, onStart, onEnd) => {
  // 1. Cancel any active pending fetch request
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  // 2. Stop any active OpenAI audio playback
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  // 3. Stop any active local browser speech synthesis
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  try {
    const response = await fetch(
      `http://localhost/voiceassistant/speak.php?text=${encodeURIComponent(text)}`,
      { signal }
    );

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudio = audio; // Keep track of active audio

      if (onStart) onStart();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (currentAudio === audio) {
          currentAudio = null;
        }
        if (onEnd) onEnd();
      };
      await audio.play();
      return;
    }
  } catch (err) {
    // Ignore aborted request errors silently
    if (err.name === "AbortError") {
      return;
    }
    console.warn("OpenAI TTS failed or key missing, falling back to local speech synthesis.");
  }

  // Native Web Speech Fallback (only run if request was not aborted)
  if (signal.aborted) return;
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance; // Pin to global variable to prevent Chrome GC bug
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech Synthesis not supported in this browser.");
    if (onEnd) onEnd();
  }
};

export const VoiceAssistantButton = ({ pageName = "Dashboard", welcomePrompt = "" }) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("Tap to speak");
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Play introductory guidance when page mounts
  useEffect(() => {
    if (welcomePrompt) {
      speakWithFallback(welcomePrompt);
    }
  }, [welcomePrompt]);

  // Handle voice command recognition and parsing
  const handleVoiceCommand = useCallback((commandText) => {
    const text = commandText.toLowerCase().trim();
    console.log("AccessRide Voice Command: ", text);

    // 1. SOS / HELP
    if (text.includes("sos") || text.includes("emergency") || text.includes("help")) {
      speakWithFallback("SOS triggered. Opening emergency console.");
      navigate("/user/sos");
      return;
    }

    // 2. LIVE TRACKING
    if (text.includes("track") || text.includes("driver") || text.includes("where")) {
      speakWithFallback("Opening live ride tracking page.");
      navigate("/user/ride");
      return;
    }

    // 3. TRIP HISTORY
    if (text.includes("history") || text.includes("trips") || text.includes("previous")) {
      speakWithFallback("Opening your ride history.");
      navigate("/user/history");
      return;
    }

    // 4. USER PROFILE
    if (text.includes("profile") || text.includes("account")) {
      speakWithFallback("Opening your profile settings.");
      navigate("/user/profile");
      return;
    }

    // 5. BOOK A RIDE
    if (text.includes("book") || text.includes("ride") || text.includes("go to")) {
      const parts = text.split("to");
      if (parts.length > 1) {
        const destination = parts[1].trim();
        speakWithFallback(`Booking a ride to ${destination}.`);
        navigate("/user/booking", { state: { voiceDestination: destination } });
      } else {
        speakWithFallback("Please say book a ride followed by your destination name.");
      }
      return;
    }

    // 6. DASHBOARD / HOME
    if (text.includes("dashboard") || text.includes("home")) {
      speakWithFallback("Heading back to the dashboard home.");
      navigate("/user/dashboard");
      return;
    }

    // No keywords matched
    speakWithFallback("Command not recognized. Say book a ride, track, history, or help.");
  }, [navigate]);

  // Set up Web Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      setStatusText("Voice recognition not supported");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatusText("Listening...");
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setStatusText(`Recognized: "${resultText}"`);
      handleVoiceCommand(resultText);
    };

    rec.onerror = (event) => {
      console.error("Speech Recognition Error: ", event.error);
      setIsListening(false);
      setStatusText("Error. Tap to try again.");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatusText("Tap to speak");
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [handleVoiceCommand]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Cancel any ongoing fallback SpeechSynthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-yellow-500 animate-pulse" />
        <h4 className="text-xs font-black text-[#0B2F89] dark:text-slate-100 uppercase tracking-widest">
          {pageName} Assistant
        </h4>
      </div>

      <button
        onClick={toggleListen}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-400 ${
          isListening
            ? "bg-red-500 border-red-200 text-white animate-pulse scale-105"
            : "bg-yellow-400 border-white text-[#0B2F89] hover:scale-105"
        }`}
        aria-label={isListening ? "Stop listening to voice commands" : "Start listening to voice commands"}
      >
        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
      </button>

      <p className="mt-4 text-xs font-extrabold text-slate-600 dark:text-slate-400 animate-pulse text-center">
        {statusText}
      </p>
    </div>
  );
};
