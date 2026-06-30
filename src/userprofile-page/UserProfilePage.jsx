import React, { useState, useEffect } from 'react';
import { 
  Menu, CircleUser, Mic, AudioLines, BadgeCheck, 
  Phone, Mail, Pencil, Accessibility, LocateFixed, 
  Bell, LogOut, ChevronRight, Home, CalendarDays, User 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState(2);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('normal');

  useEffect(() => {
    // Handle text size changes
    if (textSize == 1) {
      document.documentElement.style.fontSize = "14px";
    } else if (textSize == 2) {
      document.documentElement.style.fontSize = "16px";
    } else if (textSize == 3) {
      document.documentElement.style.fontSize = "20px";
    }
    
    // Cleanup to prevent global style bleeding on unmount
    return () => {
      document.documentElement.style.fontSize = "16px";
    };
  }, [textSize]);

  const handleActionClick = (action) => {
    alert(`Action: ${action}`);
  };

  const handleVoiceSearch = () => {
    alert("Voice search activated. Listening...");
  };

  const speedBtnClass = (speed) => {
    const isActive = voiceSpeed === speed;
    return `flex-1 py-2.5 rounded-md font-bold text-[0.9rem] transition-colors ${
      isActive ? 'bg-[#0d1b2a] text-white shadow' : 'text-slate-800'
    }`;
  };

  return (
    <div className="bg-slate-50 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-10">
          <button className="text-[#0d1b2a]" onClick={() => handleActionClick('Menu')}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-[#0d1b2a] m-0">AccessRide</h1>
          <button className="text-[#0d1b2a] flex items-center justify-center">
            <CircleUser className="w-7 h-7" />
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 px-5 pb-5 flex flex-col gap-4">
          
          {/* Voice Search FAB */}
          <div className="flex flex-col items-center mt-7 mb-5">
            <button 
              onClick={handleVoiceSearch}
              className="w-[90px] h-[90px] bg-[#ffb703] rounded-full flex items-center justify-center shadow-[0_6px_16px_rgba(255,183,3,0.4)] active:scale-95 transition-transform mb-4 border-none"
            >
              <Mic className="w-8 h-8 text-[#0d1b2a]" />
            </button>
            <span className="font-extrabold text-[#0d1b2a] text-[1.1rem]">Search rides by voice</span>
          </div>

          {/* Status Banner */}
          <div className="flex items-center gap-2.5 bg-white border border-[#0d1b2a] rounded-lg py-3.5 px-4 font-bold text-[#0d1b2a] text-[0.95rem]">
            <AudioLines className="text-[#ffb703] w-5 h-5" />
            <span>Showing your Profile</span>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="relative mb-4">
              <div className="w-[100px] h-[100px] rounded-full border-[2px] border-[#0d1b2a] bg-white flex items-center justify-center overflow-hidden">
                  <User className="w-16 h-16 text-slate-300" />
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px] flex">
                <BadgeCheck className="text-[#0d1b2a] fill-[#ffb703] w-7 h-7" />
              </div>
            </div>
            <h2 className="text-[1.5rem] font-extrabold text-[#0d1b2a] m-0 mb-3">James Dalton</h2>
            
            <div className="flex flex-col gap-2 mb-6 w-full">
              <div className="flex items-center justify-center gap-2.5 text-slate-500 font-medium text-[0.95rem]">
                <Phone className="w-3.5 h-3.5" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 text-slate-500 font-medium text-[0.95rem]">
                <Mail className="w-3.5 h-3.5" />
                <span>j.dalton@example.com</span>
              </div>
            </div>

            <button 
              onClick={() => handleActionClick('Edit Profile')}
              className="w-full bg-[#0d1b2a] text-white py-3.5 rounded-lg font-bold flex justify-center items-center gap-2.5 active:opacity-80 transition-opacity text-base"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* Accessibility Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-5">
              <Accessibility className="text-[#0d1b2a] w-6 h-6" />
              <h3 className="text-[1.15rem] font-extrabold text-[#0d1b2a] m-0">Accessibility</h3>
            </div>
            
            <div className="bg-slate-50 border border-slate-300 rounded-lg py-3.5 px-4 mb-3 flex justify-between items-center">
              <span className="font-bold text-[0.95rem] text-slate-800">High Contrast Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-12 h-6 bg-slate-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#0d1b2a]"></div>
              </label>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded-lg py-3.5 px-4">
              <span className="font-bold text-[0.95rem] text-slate-800 block mb-4">Text Size</span>
              <div className="flex items-center gap-4 px-1">
                <span className="font-extrabold text-slate-800 text-[0.85rem]">A</span>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-[#0d1b2a]"
                />
                <span className="font-extrabold text-slate-800 text-[1.15rem]">AAA</span>
              </div>
            </div>
          </div>

          {/* Voice Settings Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-5">
              <Mic className="text-[#0d1b2a] w-6 h-6" />
              <h3 className="text-[1.15rem] font-extrabold text-[#0d1b2a] m-0">Voice Settings</h3>
            </div>
            
            <div className="bg-slate-50 border border-slate-300 rounded-lg py-3.5 px-4 mb-3 flex justify-between items-center">
              <span className="font-bold text-[0.95rem] text-slate-800">Voice Guidance</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={voiceGuidance}
                  onChange={(e) => setVoiceGuidance(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-12 h-6 bg-slate-500 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#ffb703]"></div>
              </label>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded-lg py-3.5 px-4">
              <span className="font-bold text-[0.95rem] text-slate-800 block mb-3">Voice Speed</span>
              <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
                <button 
                  onClick={() => setVoiceSpeed('slow')}
                  className={speedBtnClass('slow')}
                >
                  Slow
                </button>
                <button 
                  onClick={() => setVoiceSpeed('normal')}
                  className={speedBtnClass('normal')}
                >
                  Normal
                </button>
                <button 
                  onClick={() => setVoiceSpeed('fast')}
                  className={speedBtnClass('fast')}
                >
                  Fast
                </button>
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="flex flex-col gap-4 mt-1">
            <button 
              onClick={() => handleActionClick('Emergency Contacts')}
              className="flex items-center justify-between bg-white border border-slate-300 rounded-lg py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 text-[#0d1b2a] font-extrabold text-[1.05rem]">
                <LocateFixed className="w-5 h-5" />
                <span>Emergency Contacts</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button 
              onClick={() => handleActionClick('Notifications')}
              className="flex items-center justify-between bg-white border border-slate-300 rounded-lg py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 text-[#0d1b2a] font-extrabold text-[1.05rem]">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => handleActionClick('Logout')}
            className="flex items-center justify-between bg-[#ffb703] border border-[#ffb703] rounded-lg py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform mt-1"
          >
            <div className="flex items-center gap-4 text-[#0d1b2a] font-extrabold text-[1.05rem]">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0d1b2a]" />
          </button>

        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[70px] bg-white flex justify-around items-center rounded-t-[12px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 z-20">
          <Link to="/user" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] text-slate-500 transition-colors no-underline">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] text-slate-500 transition-colors no-underline">
            <CalendarDays className="w-6 h-6" />
            <span>History</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] bg-[#ffb703] text-[#0d1b2a] transition-colors no-underline">
            <User className="w-6 h-6" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default UserProfilePage;
