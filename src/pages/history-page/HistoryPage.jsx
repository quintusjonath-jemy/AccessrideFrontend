import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import './HistoryPage.css';

import HistoryFilters from './components/HistoryFilters';
import RideCard from './components/RideCard';

import { rideData } from './data/rideData';

const HistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState('Completed');

  // Group rides by date section for rendering
  const groupedRides = rideData.reduce((acc, ride) => {
    if (!acc[ride.dateSection]) {
      acc[ride.dateSection] = [];
    }
    acc[ride.dateSection].push(ride);
    return acc;
  }, {});

  return (
    <div className="bg-slate-50 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-hidden">
        
        {/* Filters */}
        <HistoryFilters activeFilter={activeFilter} handleFilterClick={setActiveFilter} />

        {/* Voice Search FAB */}
        <div className="flex flex-col items-center mt-2 mb-6 px-4">
          <button 
            className="w-[85px] h-[85px] bg-gradient-to-br from-[#ffb703] to-[#ff9e00] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,183,3,0.4)] hover:shadow-[0_12px_30px_rgba(255,183,3,0.6)] active:scale-95 transition-all duration-300 mb-3 border-none group"
            onClick={() => alert("Voice search activated. Listening...")}
          >
            <Mic className="w-8 h-8 text-[#0d1b2a] group-hover:scale-110 transition-transform duration-300" />
          </button>
          <span className="font-extrabold text-[#0d1b2a] text-[1.05rem] tracking-tight">Book new ride by voice</span>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 flex flex-col gap-6">
          {Object.entries(groupedRides).map(([dateSection, rides], sectionIndex) => (
            <section key={dateSection} className="animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
              <h2 className="font-extrabold text-[#0d1b2a] mb-4 text-[1.15rem] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${rides[0].dateBadgeColor}`}></span> {dateSection}
              </h2>
              
              {rides.map(ride => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </section>
          ))}
        </main>

      </div>
    </div>
  );
};

export default HistoryPage;
