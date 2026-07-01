import React, { useState } from 'react';
import { Menu, Bell, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CompleteRidePage.css';

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

  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      alert("Voice command recorded! Searching for your next ride...");
    }, 3000);
  };

  const handleRating = (value) => {
    setRating(value);
    setTimeout(() => {
      setIsRated(true);
    }, 500);
  };

  const handleDone = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Redirecting to Home view...");
      navigate('/user');
    }, 800);
  };

  return (
    <div className="bg-slate-50 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col shadow-2xl">
        {/* Top Navigation */}
        <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-10">
          <Menu className="w-6 h-6 text-[#0d1b2a] cursor-pointer" />
          <h1 className="text-xl font-extrabold text-[#0d1b2a] m-0">AccessRide</h1>
          <Bell className="w-6 h-6 text-[#0d1b2a] cursor-pointer" />
        </header>

        {/* Tabs */}
        <div className="flex justify-between px-2 my-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-max mx-1 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-[#0d1b2a] text-white'
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
              <div className="absolute w-[90px] h-[90px] bg-[#ffb703] rounded-full opacity-40 animate-ping"></div>
            )}
            <button
              onClick={handleMicClick}
              className={`w-[70px] h-[70px] bg-[#ffb703] rounded-full flex justify-center items-center relative z-10 shadow-lg transition-transform ${
                isListening ? 'scale-105' : 'active:scale-95'
              }`}
            >
              <Mic className="w-8 h-8 text-[#0d1b2a]" />
            </button>
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg">Book new ride by voice</h3>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 pb-6 flex flex-col gap-4 bg-white rounded-t-3xl pt-6 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] border-t border-slate-200 mt-2">
          <h2 className="text-[#0d1b2a] font-extrabold text-xl m-0">Today, {rideDetails.date}</h2>

          {/* Main Card */}
          <RideSummary rideDetails={rideDetails} />

          {/* Rating */}
          <RatingSection 
            isRated={isRated} 
            rating={rating} 
            handleRating={handleRating} 
            driverName={rideDetails.driverName}
          />

          {/* Action Buttons */}
          <div className="mt-4 pb-4">
            <button 
              onClick={handleDone}
              disabled={isProcessing}
              className={`w-full bg-[#0d1b2a] text-white font-bold text-base py-4 rounded-xl shadow-md transition-opacity ${
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
