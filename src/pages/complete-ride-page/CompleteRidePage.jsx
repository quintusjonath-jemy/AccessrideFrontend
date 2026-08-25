import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CompleteRidePage.css';
import DashboardHeader from '../../UserDashboard/components/DashboardHeader';
import RideSummary from './components/RideSummary';
import RatingSection from './components/RatingSection';
import { rideDetails } from './data/rideDetails';
import API_BASE from "../../config/api";
import { speakWithFallback } from "../../UserDashboard/components/voiceassistant/VoiceAssistant";

// Helper to parse spoken star ratings
const parseRatingFromSpeech = (text) => {
  const t = text.toLowerCase();
  if (t.includes("5") || t.includes("five") || t.includes("excellent") || t.includes("great") || t.includes("best") || t.includes("maximum")) return 5;
  if (t.includes("4") || t.includes("four") || t.includes("good")) return 4;
  if (t.includes("3") || t.includes("three") || t.includes("okay") || t.includes("average") || t.includes("medium")) return 3;
  if (t.includes("2") || t.includes("two") || t.includes("bad") || t.includes("poor")) return 2;
  if (t.includes("1") || t.includes("one") || t.includes("terrible") || t.includes("worst") || t.includes("minimum")) return 1;
  return null;
};

const CompleteRidePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Completed');
  const [isListening, setIsListening] = useState(false);
  const [rating, setRating] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ride, setRide] = useState(null);
  const [user, setUser] = useState(null);
  const [, setLoading] = useState(true);

  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];
  const recRef = useRef(null);
  const manualStopRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const speak = (text, onFinish) => {
    isSpeakingRef.current = true;
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
    }
    speakWithFallback(
      text,
      () => setIsListening(false),
      () => {
        isSpeakingRef.current = false;
        if (!manualStopRef.current && recRef.current) {
          setTimeout(() => {
            if (!manualStopRef.current && !isSpeakingRef.current && recRef.current) {
              try { recRef.current.start(); } catch (_) {}
            }
          }, 300);
        }
        if (onFinish) onFinish();
      }
    );
  };

  const handleRating = useCallback((value) => {
    setRating(value);
    if (ride && ride.id) {
      axios.post(`${API_BASE}/UserDashboard/api/rate_ride.php`, {
        ride_id: ride.id,
        rating: value
      })
      .then(res => {
        if (res.data?.success) {
          setIsRated(true);
        }
      })
      .catch(err => {
        console.error("Error submitting rating:", err);
      });
    } else {
      setTimeout(() => {
        setIsRated(true);
      }, 500);
    }
  }, [ride]);

  const handleRatingRef = useRef(handleRating);
  useEffect(() => {
    handleRatingRef.current = handleRating;
  }, [handleRating]);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id") || "1";
    
    // Fetch profile
    fetch(`${API_BASE}/history_and_profile/profile/get_profile.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setUser(data);
        }
      })
      .catch(err => console.error("Error fetching profile:", err));

    // Fetch latest completed ride
    axios.get(`${API_BASE}/UserDashboard/api/latest_completed_ride.php?user_id=${userId}`)
      .then(res => {
        if (res.data?.success && res.data.ride) {
          setRide(res.data.ride);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching latest ride:", err);
        setLoading(false);
      });
  }, []);

  // Voice Assistant: Always-On Continuous Speech Recognition & Rating
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const lastIdx = e.results.length - 1;
      const transcript = e.results[lastIdx][0].transcript.toLowerCase().trim();

      // Check for navigation commands
      if (transcript.includes("go home") || transcript.includes("dashboard") || transcript.includes("main menu") || transcript.includes("done")) {
        speak("Heading back to your dashboard.");
        setTimeout(() => navigate('/user/dashboard'), 1000);
        return;
      }
      if (transcript.includes("book") || transcript.includes("new ride")) {
        speak("Opening booking page.");
        setTimeout(() => navigate('/user/booking', { state: { voiceMode: true, step: 1 } }), 1000);
        return;
      }
      if (transcript.includes("history") || transcript.includes("my ride")) {
        speak("Opening your ride history.");
        setTimeout(() => navigate('/user/history'), 1000);
        return;
      }

      // Check for 1 to 5 star ratings
      const stars = parseRatingFromSpeech(transcript);
      if (stars) {
        handleRatingRef.current(stars);
        speak(`Thank you! You rated your driver ${stars} ${stars === 1 ? "star" : "stars"}.`);
      } else {
        speak("Please say a rating from 1 to 5 stars, or say dashboard to return home.");
      }
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
    };

    rec.onend = () => {
      if (!manualStopRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!manualStopRef.current && !isSpeakingRef.current && recRef.current) {
            try { recRef.current.start(); } catch (_) {}
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    manualStopRef.current = false;
    
    // Initial arrival prompt & start listening
    const timer = setTimeout(() => {
      speak(
        "Thank you for riding with AccessRide! Your trip is complete. Please rate your driver from 1 to 5 stars."
      );
    }, 800);

    return () => {
      clearTimeout(timer);
      manualStopRef.current = true;
      rec.abort();
    };
  }, [navigate]);

  const handleMicClick = () => {
    if (!recRef.current) return;
    if (isListening) {
      manualStopRef.current = true;
      setIsListening(false);
      try { recRef.current.stop(); } catch (_) {}
    } else {
      manualStopRef.current = false;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      try { recRef.current.start(); } catch (_) {}
    }
  };

  const handleDone = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/user/dashboard');
    }, 400);
  };

  // Format ride details from the fetched database record (or fallback to mockup data)
  const activeRideDetails = ride ? {
    status: ride.status ? (ride.status.charAt(0).toUpperCase() + ride.status.slice(1)) : "Completed",
    date: new Date(ride.ride_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: new Date(ride.ride_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    driverInitial: ride.driver_name ? ride.driver_name.charAt(0).toUpperCase() : "D",
    driverName: ride.driver_name || "AccessRide Driver",
    accessible: ride.vehicle_type === "Wheelchair Accessible Vehicle" || ride.vehicle_type === "van",
    vehicle: ride.vehicle_type ? (ride.vehicle_type.charAt(0).toUpperCase() + ride.vehicle_type.slice(1)) : "Vehicle",
    licensePlate: ride.vehicle_number || "AccessRide",
    totalFare: `Rs. ${parseFloat(ride.fare).toFixed(2)}`,
    route: [
      {
        time: new Date(ride.ride_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        address: ride.pickup_location || "Pickup Location",
        colorClass: "bg-white",
        isPickup: true
      },
      {
        time: "--:--",
        address: ride.dropoff_location || "Dropoff Location",
        colorClass: "bg-[#ffb703]",
        isPickup: false
      }
    ]
  } : rideDetails;

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-100 min-h-screen relative flex flex-col shadow-2xl">
        {/* Top Navigation */}
        <DashboardHeader user={user} />

        {/* Tabs */}
        <div className="flex justify-between px-2 my-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-max mx-1 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-[#0B2F89] text-white'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Voice Booking CTA */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative mb-3 flex items-center justify-center">
            {isListening && (
              <div className="absolute w-[90px] h-[90px] bg-[#FEC329] rounded-full opacity-40 animate-ping"></div>
            )}
            <button
              onClick={handleMicClick}
              className={`w-[70px] h-[70px] bg-[#FEC329] rounded-full flex justify-center items-center relative z-10 shadow-lg transition-transform ${
                isListening ? 'scale-105' : 'active:scale-95'
              }`}
            >
              <Mic className="w-8 h-8 text-[#0B2F89]" />
            </button>
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg">Book new ride by voice</h3>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 pb-6 flex flex-col gap-4 bg-white rounded-t-3xl pt-6 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-slate-200 mt-2">
          <h2 className="text-[#0B2F89] font-extrabold text-xl m-0">Today, {activeRideDetails.date}</h2>

          {/* Main Card */}
          <RideSummary rideDetails={activeRideDetails} />

          {/* Rating */}
          <RatingSection 
            isRated={isRated} 
            rating={rating} 
            handleRating={handleRating} 
            driverName={activeRideDetails.driverName}
          />

          {/* Action Buttons */}
          <div className="mt-4 pb-4">
            <button 
              onClick={handleDone}
              disabled={isProcessing}
              className={`w-full bg-[#0B2F89] text-white font-bold text-base py-4 rounded-xl shadow-md transition-opacity ${
                isProcessing ? 'opacity-70' : 'active:opacity-90'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Done'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompleteRidePage;


