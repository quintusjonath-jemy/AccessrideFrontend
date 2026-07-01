import React from 'react';
import { CheckCircle2, XCircle, Accessibility, RefreshCw } from 'lucide-react';

const RideCard = ({ ride }) => {
  const isCompleted = ride.status === 'Completed';

  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-5 relative overflow-hidden ${isCompleted ? 'group' : ''}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${ride.bgColorClass} rounded-bl-full opacity-50 -z-10`}></div>
      
      {/* Card Header */}
      <div className="flex justify-between items-center mb-5">
        <span className={`${ride.statusBadgeClass} text-[0.75rem] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} 
          {ride.status}
        </span>
        <span className="text-slate-500 font-bold text-sm bg-slate-50 px-3 py-1 rounded-full">{ride.time}</span>
      </div>

      {/* Driver Info */}
      {ride.driverName && (
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl p-3 flex items-center gap-4 mb-6 shadow-sm group-hover:border-slate-200 transition-colors">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0d1b2a] to-[#1a365d] flex items-center justify-center">
             <div className="text-white font-bold text-lg">{ride.driverInitial}</div>
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-[#0d1b2a] text-[1rem]">{ride.driverName}</div>
            {ride.accessible && (
              <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-slate-500 mt-1 bg-slate-100 w-max px-2 py-0.5 rounded-md">
                <Accessibility className="w-3.5 h-3.5 text-[#ffb703]" />
                <span>Wheelchair Accessible</span>
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="font-extrabold text-[#0d1b2a] text-sm">{ride.vehicle}</div>
            <div className="bg-[#0d1b2a] text-white text-[0.7rem] font-bold px-2 py-1 rounded mt-1 tracking-wider shadow-sm">{ride.licensePlate}</div>
          </div>
        </div>
      )}

      {/* Route */}
      <div className="ml-2.5 relative border-l-2 border-dashed border-slate-200 pl-6 pb-2 flex flex-col gap-6 mb-6">
        {/* Start Location */}
        <div className="relative">
          <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 ${isCompleted ? 'bg-[#10b981] ring-green-50' : 'bg-slate-300 ring-slate-50'} rounded-full ring-4 shadow-sm`}></div>
          <div className={`font-extrabold ${isCompleted ? 'text-[#0d1b2a]' : 'text-slate-500 line-through decoration-slate-300'} text-[1rem] leading-tight mb-1`}>{ride.startLocation}</div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Start Location</div>
        </div>
        {/* End Location */}
        <div className="relative">
          <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 ${isCompleted ? 'bg-[#ef4444] ring-red-50' : 'bg-slate-300 ring-slate-50'} rounded-full ring-4 shadow-sm`}></div>
          <div className={`font-extrabold ${isCompleted ? 'text-[#0d1b2a]' : 'text-slate-500 line-through decoration-slate-300'} text-[1rem] leading-tight mb-1`}>{ride.endLocation}</div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drop-off</div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex gap-2 ${ride.driverName ? 'mt-2' : ''}`}>
        <button className={`flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold ${isCompleted ? 'text-[0.85rem]' : 'text-[0.9rem]'} transition-colors whitespace-nowrap`}>
          Need Help?
        </button>
        {isCompleted ? (
          <>
            <button className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.85rem] transition-colors whitespace-nowrap">
              Rate Driver
            </button>
            <button className="flex-[1.2] py-3 px-2 rounded-xl bg-gradient-to-r from-[#0d1b2a] to-[#1a365d] text-white font-extrabold text-[0.85rem] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all whitespace-nowrap">
              <RefreshCw className="w-4 h-4" /> Rebook
            </button>
          </>
        ) : (
          <button className="flex-1 py-3 rounded-xl bg-slate-50 text-[#0d1b2a] border border-[#0d1b2a]/20 hover:bg-[#0d1b2a] hover:text-white font-extrabold text-[0.9rem] transition-all">
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default RideCard;
