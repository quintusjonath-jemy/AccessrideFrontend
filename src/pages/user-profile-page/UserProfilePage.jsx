import React, { useState, useEffect } from 'react';
import { Menu, AudioLines, LocateFixed, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';
import DashboardHeader from '../../UserDashboard/components/DashboardHeader';
import ProfileCard from './components/ProfileCard';
import AccessibilityCard from './components/AccessibilityCard';
import VoiceSettingsCard from './components/VoiceSettingsCard';
import { userData } from './data/userData';
import API_BASE from "../../config/api";
import { VoiceAssistantButton } from '../../UserDashboard/components/voiceassistant/VoiceAssistant';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState(2);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('normal');
  const [user, setUser] = useState(userData);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id") || "1";
    
    fetch(`${API_BASE}/history_and_profile/profile/get_profile.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching profile", err));
  }, []);

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
    if (action === 'Edit Profile') {
      const newName = prompt("Enter new name:", user.name);
      const newPhone = prompt("Enter new phone:", user.phone);
      const newLocation = prompt("Enter new address:", user.location);
      
      if (newName !== null && newPhone !== null && newLocation !== null) {
        const userId = sessionStorage.getItem("user_id") || "1";
        fetch(`${API_BASE}/history_and_profile/profile/update_profile.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userId,
            name: newName,
            phone: newPhone,
            location: newLocation,
            email: user.email
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message);
            setUser({ ...user, name: newName, phone: newPhone, location: newLocation });
          } else {
            alert(data.error || "Update failed");
          }
        })
        .catch(err => console.error("Error updating profile", err));
      }
      return;
    }
    
    if (action === 'Notifications') {
       navigate('/user/notifications');
       return;
    }

    if (action === 'Logout') {
       localStorage.removeItem("user_id");
       sessionStorage.clear();
       navigate('/login');
       return;
    }
    alert(`Action: ${action}`);
  };

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-100 min-h-screen pb-[90px] relative flex flex-col">
         {/* Top Navigation */}
        <DashboardHeader user={user} />

        {/* Main Content */}
        <main className="flex-1 px-5 pb-5 flex flex-col gap-4">
          
          {/* Voice Assistant UI */}
          <div className="mt-4 mb-2">
            <VoiceAssistantButton
              pageName="Profile"
              welcomePrompt="Welcome to your profile. Say edit profile, change address, book a ride, or SOS."
            />
          </div>

          {/* Status Banner */}
          <div className="flex items-center gap-2.5 bg-white border border-[#0B2F89] rounded-2xl py-3.5 px-4 font-bold text-[#0B2F89] text-sm">
            <AudioLines className="text-[#FEC329] w-5 h-5" />
            <span>Showing your Profile</span>
          </div>

          {/* Profile Card */}
          <ProfileCard userData={user} handleActionClick={handleActionClick} />

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
              className="flex items-center justify-between bg-white border border-slate-300 rounded-2xl py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 text-[#0B2F89] font-extrabold text-lg">
                <LocateFixed className="w-5 h-5" />
                <span>Emergency Contacts</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button 
              onClick={() => handleActionClick('Notifications')}
              className="flex items-center justify-between bg-white border border-slate-300 rounded-2xl py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 text-[#0B2F89] font-extrabold text-lg">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => handleActionClick('Logout')}
            className="flex items-center justify-between bg-[#FEC329] border border-[#FEC329] rounded-2xl py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform mt-1"
          >
            <div className="flex items-center gap-4 text-[#0B2F89] font-extrabold text-lg">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#0B2F89]" />
          </button>

        </main>

      </div>
    </div>
  );
};

export default UserProfilePage;



