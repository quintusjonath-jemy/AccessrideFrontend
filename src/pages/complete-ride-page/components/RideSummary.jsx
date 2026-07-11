import React from 'react';
import { CheckCircle2, Accessibility } from 'lucide-react';

const RideSummary = ({ rideDetails }) => {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Status Row */}
      <div className="flex justify-between items-center bg-white py-2 px-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-50 px-2 py-1 rounded-md">
          <CheckCircle2 className="w-4 h-4" /> {rideDetails.status}
        </div>
        <div className="text-slate-500 font-medium text-sm">{rideDetails.date}, {rideDetails.time}</div>
      </div>

      {/* Driver & Car Info */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0B2F89] text-white rounded-full flex items-center justify-center font-extrabold text-xl">
            {rideDetails.driverInitial}
          </div>
          <div className="flex flex-col">
            <span className="text-[#0B2F89] font-extrabold text-base">{rideDetails.driverName}</span>
            {rideDetails.accessible && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-1">
                <Accessibility className="w-3.5 h-3.5" />
                <span>Wheelchair Accessible</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-800 font-extrabold text-sm">{rideDetails.vehicle}</span>
          <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded mt-1">
            {rideDetails.licensePlate}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full my-1"></div>

      {/* Fare & Route details */}
      <div className="flex justify-between items-center py-1">
        <span className="text-slate-500 font-bold text-sm">Total Fare</span>
        <span className="text-[#0B2F89] font-extrabold text-lg">{rideDetails.totalFare}</span>
      </div>

      <div className="flex flex-col relative pl-6 mt-2">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
        
        {rideDetails.route.map((stop, index) => (
          <div key={index} className={`relative flex gap-4 items-start ${index === 0 ? 'mb-5' : ''}`}>
            <div className={`absolute -left-6 top-1.5 w-3.5 h-3.5 ${stop.colorClass} border-4 border-[#0B2F89] rounded-full`}></div>
            <div className="flex flex-col">
              <span className="text-[#0B2F89] font-bold text-xs mb-0.5">{stop.time}</span>
              <span className="text-slate-600 font-medium text-sm">{stop.address}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideSummary;



