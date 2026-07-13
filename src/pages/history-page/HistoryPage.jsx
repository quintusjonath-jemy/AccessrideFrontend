import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import './HistoryPage.css';
import DashboardHeader from '../../UserDashboard/components/DashboardHeader';
import HistoryFilters from './components/HistoryFilters';
import RideCard from './components/RideCard';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Completed');
  const [rides, setRides] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";
    
    // Fetch profile for header
    fetch(`http://localhost/history_and_profile/profile/get_profile.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setUser(data);
        }
      })
      .catch(err => console.error("Error fetching profile", err));

    // Fetch ride history
    fetch(`http://localhost/history_and_profile/history/get_history.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRides(data);
        }
      })
      .catch(err => console.error("Error fetching history", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter rides based on active filter
  const filteredRides = rides.filter(ride => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upcoming') {
      return ['Pending', 'Accepted', 'Active', 'Scheduled'].includes(ride.status);
    }
    return ride.status === activeFilter;
  });

  // Group rides by date section for rendering
  const groupedRides = filteredRides.reduce((acc, ride) => {
    if (!acc[ride.dateSection]) {
      acc[ride.dateSection] = [];
    }
    acc[ride.dateSection].push(ride);
    return acc;
  }, {});

  const handleRebook = (ride) => {
    // Map vehicle string to the correct type id
    let vehicleType = "car";
    const vStr = (ride.vehicle || "").toLowerCase();
    if (vStr.includes("car")) vehicleType = "car";
    else if (vStr.includes("van")) vehicleType = "van";
    else if (vStr.includes("three wheeler") || vStr.includes("auto") || vStr.includes("tuktuk")) vehicleType = "three wheeler";
    else if (vStr.includes("bike") || vStr.includes("moto")) vehicleType = "bike";

    navigate("/user/booking", {
      state: {
        step: 2, // Skip vehicle selection step
        vehicleType: vehicleType,
        pickup: ride.startLocation || "",
        dropoff: ride.endLocation || ""
      }
    });
  };

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-100 min-h-screen pb-[90px] relative flex flex-col shadow-2xl">

        {/* Top Navigation */}
        <DashboardHeader user={user} />
        
        {/* Filters */}
        <HistoryFilters activeFilter={activeFilter} handleFilterClick={setActiveFilter} />

        {/* Voice Search FAB */}
        <div className="flex flex-col items-center mt-2 mb-6 px-4">
          <button 
            className="w-[85px] h-[85px] bg-gradient-to-br from-[#FEC329] to-[#FEC329] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,183,3,0.4)] hover:shadow-[0_12px_30px_rgba(255,183,3,0.6)] active:scale-95 transition-all duration-300 mb-3 border-none group"
            onClick={() => alert("Voice search activated. Listening...")}
          >
            <Mic className="w-8 h-8 text-[#0B2F89] group-hover:scale-110 transition-transform duration-300" />
          </button>
          <span className="font-extrabold text-[#0B2F89] text-lg tracking-tight">Book new ride by voice</span>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading history...
            </div>
          ) : Object.keys(groupedRides).length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-semibold">
              No rides found
            </div>
          ) : (
            Object.entries(groupedRides).map(([dateSection, rides], sectionIndex) => (
              <section key={dateSection} className="animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
                <h2 className="font-extrabold text-[#0B2F89] mb-4 text-xl flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rides[0].dateBadgeColor}`}></span> {dateSection}
                </h2>
                
                {rides.map(ride => (
                  <RideCard key={ride.id} ride={ride} onRebook={handleRebook} />
                ))}
              </section>
            ))
          )}
        </main>

      </div>
    </div>
  );
};

export default HistoryPage;


