import React from 'react';

const HistoryFilters = ({ activeFilter, handleFilterClick }) => {
  const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 sticky top-[68px] bg-white/90 backdrop-blur-md z-10 border-b border-slate-200 shadow-sm mb-4">
      {filters.map(filter => (
        <button 
          key={filter}
          onClick={() => handleFilterClick(filter)}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
            activeFilter === filter 
              ? 'bg-gradient-to-r from-[#0d1b2a] to-[#1a365d] text-white shadow-lg shadow-blue-900/20 scale-105' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default HistoryFilters;
