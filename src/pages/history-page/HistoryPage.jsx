import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import './HistoryPage.css';
import { UserCircle, LogOut, Settings, ChevronDown } from "lucide-react";

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
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-100 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-hidden">

        {/* Top Navigation */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-slate-100 shadow-md z-50 flex justify-between items-center px-4">
      <h1 className="text-xl font-extrabold">
        <span className="text-[#FEC329]">Access</span>
        <span className="text-[#0B2F89]">Ride</span>
      </h1>

      {/* <div ref={dropdownRef} className="relative"> */}
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-1 focus:outline-none"
        >
          <UserCircle
            size={32}
            className="text-[#0B2F89] hover:scale-105 transition"
          />
          <ChevronDown size={14} className="text-[#0B2F89]" />
        </button>
          
        </header>
        
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
          {Object.entries(groupedRides).map(([dateSection, rides], sectionIndex) => (
            <section key={dateSection} className="animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
              <h2 className="font-extrabold text-[#0B2F89] mb-4 text-xl flex items-center gap-2">
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


