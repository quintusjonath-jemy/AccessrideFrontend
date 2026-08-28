import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UserCircle, CalendarRange, Clock } from "lucide-react";
import axios from "axios";

import ScheduleForm from "../components/ScheduleForm";
import ScheduledRidesList from "../components/ScheduledRidesList";
import API_BASE from "../../config/api";
import { speakWithFallback } from "../components/voiceassistant/VoiceAssistant";

const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.activeTab || "form";
  const [activeTab, setActiveTab] = useState(initialTab); // "form" or "list"
  const [scheduledRides, setScheduledRides] = useState([]);
  const [editingRide, setEditingRide] = useState(null);
  const hasSpokenListRef = useRef(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id") || "1";
    axios.get(`${API_BASE}/UserDashboard/api/schedule.php?user_id=${userId}`)
      .then(res => {
        if (res.data.success && res.data.data !== null) {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          setScheduledRides(list);

          // If requested via voice command ("show my schedule list"), read schedules one by one
          if (location.state?.readSchedules && !hasSpokenListRef.current) {
            hasSpokenListRef.current = true;
            if (list.length === 0) {
              speakWithFallback("You don't have any upcoming scheduled rides.");
            } else {
              let speechText = `You have ${list.length} upcoming scheduled ${list.length === 1 ? "ride" : "rides"}. `;
              list.forEach((ride, idx) => {
                const vehicle = ride.vehicle_type || ride.wheelchair_type || "Vehicle";
                const dateStr = ride.ride_date || "Upcoming time";
                const dest = ride.dropoff_location || "Destination";
                speechText += `Schedule ${idx + 1}: ${vehicle} to ${dest} on ${dateStr}. `;
              });
              speakWithFallback(speechText);
            }
          }
        }
      })
      .catch(err => {
        console.error("Error loading schedules:", err);
      });
  }, [location.state?.readSchedules]);

  const handleAddSchedule = (newRide) => {
    setScheduledRides((prev) => [newRide, ...prev]);
    setActiveTab("list"); // Switch to list tab to see the newly scheduled ride!
  };

  const handleUpdateSchedule = (updatedRide) => {
    setScheduledRides((prev) =>
      prev.map((ride) => (ride.id === updatedRide.id ? updatedRide : ride))
    );
    setEditingRide(null);
    setActiveTab("list");
  };

  const handleCancelSchedule = (rideId) => {
    if (window.confirm("Are you sure you want to cancel this scheduled ride?")) {
      const userId = sessionStorage.getItem("user_id") || "1";
      axios.delete(`${API_BASE}/UserDashboard/api/schedule.php?ride_id=${rideId}&user_id=${userId}`)
      .then(res => {
        if (res.data.success) {
          setScheduledRides((prev) => prev.filter((r) => r.id !== rideId));
        } else {
          alert(res.data.message || "Failed to cancel ride");
        }
      })
      .catch(err => {
        console.error("Error cancelling ride:", err);
        alert("An error occurred. Please try again.");
      });
    }
  };

  const handleEditSchedule = (ride) => {
    setEditingRide(ride);
    setActiveTab("form");
  };

  const handleCancelEdit = () => {
    setEditingRide(null);
    setActiveTab("list");
  };

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans w-full">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-x-hidden">
        <div>
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 bg-white shadow-sm mb-4">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="text-[#0B2F89] hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft size={22} />
            </button>
            
            <h1 className="text-lg font-bold text-[#0B2F89]">Schedule</h1>
            
            <button className="text-[#0B2F89]">
              <UserCircle size={28} />
            </button>
          </header>

          {/* Tab Switcher */}
          <div className="px-5 mb-5">
            <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "form"
                    ? "bg-white text-[#0B2F89] shadow-sm"
                    : "text-slate-500 hover:text-[#0B2F89]"
                }`}
              >
                <Clock size={14} />
                <span>Book Advance</span>
              </button>
              
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "list"
                    ? "bg-white text-[#0B2F89] shadow-sm"
                    : "text-slate-500 hover:text-[#0B2F89]"
                }`}
              >
                <CalendarRange size={14} />
                <span>My Schedules ({scheduledRides.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="px-5">
            {activeTab === "form" ? (
              <ScheduleForm
                onScheduleAdded={handleAddSchedule}
                onScheduleUpdated={handleUpdateSchedule}
                editingRide={editingRide}
                onCancelEdit={handleCancelEdit}
                initialState={location.state}
              />
            ) : (
              <ScheduledRidesList
                rides={scheduledRides}
                onCancel={handleCancelSchedule}
                onEdit={handleEditSchedule}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
