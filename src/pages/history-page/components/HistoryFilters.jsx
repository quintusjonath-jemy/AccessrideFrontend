import React from 'react';

const HistoryFilters = ({ activeFilter, handleFilterClick }) => {
  const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  return (
    <div className="flex justify-between px-2 my-2 overflow-x-auto hide-scrollbar">
      {filters.map(filter => (
        <button 
          key={filter}
          onClick={() => handleFilterClick(filter)}
          className={`flex-1 min-w-max mx-1 py-2 rounded-full text-sm font-bold transition-colors ${
            activeFilter === filter 
              ? 'bg-[#0B2F89] text-white' 
              : 'bg-white text-slate-500 border border-slate-200'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default HistoryFilters;


