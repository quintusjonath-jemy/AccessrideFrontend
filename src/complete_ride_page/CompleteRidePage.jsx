import React, { useState } from 'react';
import { Menu, Bell, Mic, CheckCircle2, Star, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
          <h2 className="text-[#0d1b2a] font-extrabold text-xl m-0">Today, June 24</h2>

          {/* Main Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
            {/* Status Row */}
            <div className="flex justify-between items-center bg-white py-2 px-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </div>
              <div className="text-slate-500 font-medium text-sm">June 24, 09:30 AM</div>
            </div>

            {/* Driver & Car Info */}
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0d1b2a] text-white rounded-full flex items-center justify-center font-extrabold text-xl">
                  M
                </div>
                <div className="flex flex-col">
                  <span className="text-[#0d1b2a] font-extrabold text-base">Michael C.</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-1">
                    <Accessibility className="w-3.5 h-3.5" />
                    <span>Wheelchair Accessible</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-800 font-extrabold text-sm">Honda Odyssey</span>
                <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded mt-1">
                  ABC-123
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full my-1"></div>

            {/* Fare & Route details */}
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-bold text-sm">Total Fare</span>
              <span className="text-[#0d1b2a] font-extrabold text-lg">$34.50</span>
            </div>

            <div className="flex flex-col relative pl-6 mt-2">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
              
              <div className="relative mb-5 flex gap-4 items-start">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 bg-white border-4 border-[#0d1b2a] rounded-full"></div>
                <div className="flex flex-col">
                  <span className="text-[#0d1b2a] font-bold text-xs mb-0.5">10:15 AM</span>
                  <span className="text-slate-600 font-medium text-sm">123 Startup Blvd</span>
                </div>
              </div>
              
              <div className="relative flex gap-4 items-start">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 bg-[#ffb703] border-4 border-[#0d1b2a] rounded-full"></div>
                <div className="flex flex-col">
                  <span className="text-[#0d1b2a] font-bold text-xs mb-0.5">10:42 AM</span>
                  <span className="text-slate-600 font-medium text-sm">880 Innovation Ave</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-2 flex flex-col items-center justify-center text-center shadow-sm">
            {!isRated ? (
              <>
                <h3 className="text-[#0d1b2a] font-extrabold mb-4">Rate your driver</h3>
                <div className="flex gap-2 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleRating(star)} className="focus:outline-none">
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          rating >= star ? 'fill-[#ffb703] text-[#ffb703]' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-2 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-green-700 mx-auto mb-3" />
                <h3 className="text-[#0d1b2a] font-extrabold text-lg mb-1">Thank You!</h3>
                <p className="text-slate-500 font-medium text-sm">
                  You rated Michael {rating} stars.
                </p>
              </div>
            )}
          </div>

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
