import React, { useState, useEffect } from 'react';
import { Mic, AudioLines, LocateFixed, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

import ProfileCard from './components/ProfileCard';
import AccessibilityCard from './components/AccessibilityCard';
import VoiceSettingsCard from './components/VoiceSettingsCard';

import { userData } from './data/userData';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState(2);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('normal');

  useEffect(() => {
    if (textSize === 1) {
      document.documentElement.style.fontSize = "14px";
    } else if (textSize === 2) {
      document.documentElement.style.fontSize = "16px";
    } else if (textSize === 3) {
      document.documentElement.style.fontSize = "20px";
    }
    
    return () => {
      document.documentElement.style.fontSize = "16px";
    };
  }, [textSize]);

  const handleActionClick = (action) => {
    alert(`Action: ${action}`);
    if (action === 'Logout') {
       navigate('/login');
    }
  };

  const handleVoiceSearch = () => {
    alert("Voice search activated. Listening...");
  };

  return (
    <div className="bg-slate-50 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col">
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
          <ProfileCard userData={userData} handleActionClick={handleActionClick} />

          {/* Accessibility Card */}
          <AccessibilityCard 
            highContrast={highContrast} 
            setHighContrast={setHighContrast} 
            textSize={textSize} 
            setTextSize={setTextSize} 
          />

          {/* Voice Settings Card */}
          <VoiceSettingsCard 
            voiceGuidance={voiceGuidance} 
            setVoiceGuidance={setVoiceGuidance} 
            voiceSpeed={voiceSpeed} 
            setVoiceSpeed={setVoiceSpeed} 
          />

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

      </div>
    </div>
  );
};

export default UserProfilePage;
