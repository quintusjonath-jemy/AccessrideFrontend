import React, { useState, useEffect } from 'react';
import { Menu, Bell, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CompleteRidePage.css';
import { UserCircle, LogOut, Settings, ChevronDown } from "lucide-react";

import RideSummary from './components/RideSummary';
import RatingSection from './components/RatingSection';

import { rideDetails } from './data/rideDetails';

const CompleteRidePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Completed');
  const [isListening, setIsListening] = useState(false);
  const [rating, setRating] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || 1;
    axios.get(`http://localhost/UserDashboard/api/latest_completed_ride.php?user_id=${userId}`)
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

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      alert("Voice command recorded! Searching for your next ride...");
    }, 3000);
  };

  const handleRating = (value) => {
    setRating(value);
    if (ride && ride.id) {
      axios.post("http://localhost/UserDashboard/api/rate_ride.php", {
        ride_id: ride.id,
        rating: value
      })
      .then(res => {
        if (res.data?.success) {
          setIsRated(true);
        } else {
          alert(res.data.message || "Failed to submit rating");
        }
      })
      .catch(err => {
        console.error("Error submitting rating:", err);
        alert("An error occurred while submitting your rating.");
      });
    } else {
      setTimeout(() => {
        setIsRated(true);
      }, 500);
    }
  };

  const handleDone = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Redirecting to Home view...");
      navigate('/user');
    }, 800);
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
        <header className="flex justify-between items-center p-4 bg-slate-100 sticky top-0 z-50">
          <h1 className="text-xl font-extrabold">
            <span className="text-[#FEC329]">Access</span>
            <span className="text-[#0B2F89]">Ride</span>
          </h1>

          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <UserCircle
                size={32}
                className="text-[#0B2F89] hover:scale-105 transition"
              />
              <ChevronDown size={14} className="text-[#0B2F89]" />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50">
                <button
                  onClick={() => { setOpenMenu(false); navigate("/user/profile"); }}
                  className="flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-slate-50 w-full text-left font-bold text-sm cursor-pointer"
                >
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    sessionStorage.clear();
                    navigate("/login");
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left font-bold text-sm cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

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


