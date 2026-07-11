import React from 'react';
import { CheckCircle2, XCircle, MapPin, Receipt, RefreshCw } from 'lucide-react';

const RideCard = ({ ride }) => {
  const isCompleted = ride.status === 'Completed';
  const isCancelled = ride.status === 'Cancelled';

  // Fallbacks for new fields if they don't exist in data
  const rideDate = ride.date || (isCancelled ? 'Oct 18, 2024' : 'Oct 24, 2024');
  const rideId = ride.id ? `#AR-690${ride.id}` : (isCancelled ? '#AR-6902' : '#AR-8821');
  const price = isCancelled ? '$0.00' : (ride.price || '$14.50');
  
  // Custom time fallback for the cancelled one to match image
  const time = ride.time || (isCancelled ? '05:45 PM' : '02:30 PM');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="text-xl font-extrabold text-[#233876]">{rideDate}</div>
          <div className="text-[15px] font-bold text-slate-500 mt-0.5 tracking-wide">
            {time} &bull; {rideId}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[13px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isCompleted ? 'bg-[#5eead4] text-[#0f766e]' : 'bg-[#fce8e8] text-[#a52a2a]'}`}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {ride.status}
          </span>
          <div className="text-[26px] font-extrabold text-[#233876] mt-2">
            {price}
          </div>
        </div>
      </div>

      {isCompleted ? (
        <>
          {/* Route */}
          <div className="relative pl-8 flex flex-col gap-6 mb-7 mt-2">
            {/* Connecting line */}
            <div className="absolute left-[11px] top-[14px] bottom-[14px] w-0.5 border-l-2 border-dashed border-slate-200"></div>
            
            {/* Pickup */}
            <div className="relative">
              <div className="absolute -left-[32px] top-0.5 w-6 h-6 rounded-full border-[5px] border-[#0e2769] bg-white z-10"></div>
              <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup</div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight">{ride.startLocation}</div>
            </div>

            {/* Drop-off */}
            <div className="relative">
              <div className="absolute -left-[32px] top-0.5 w-6 h-6 rounded-full bg-[#0d6b63] flex items-center justify-center text-white z-10">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1">Drop-off</div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight">{ride.endLocation}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button className="w-full py-3.5 rounded-xl bg-[#2a4387] text-white font-extrabold text-[17px] flex items-center justify-center gap-2 hover:bg-[#1a3066] transition-colors">
              <Receipt className="w-5 h-5" /> View Receipt
            </button>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl bg-[#fbbf24] text-[#0e2769] font-extrabold text-[17px] hover:bg-[#f59e0b] transition-colors">
                Book Again
              </button>
              <button className="flex-1 py-3.5 rounded-xl bg-[#fbbf24] text-[#0e2769] font-extrabold text-[17px] hover:bg-[#f59e0b] transition-colors">
                Report Issue
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Cancelled State Content */}
          <div className="mb-6 mt-2">
            <p className="text-[17px] text-slate-500 font-medium leading-relaxed">
              Trip cancelled by passenger. No charges applied.
            </p>
          </div>

          {/* Cancelled Actions */}
          <button className="w-full py-3.5 rounded-xl bg-[#facc15] text-[#1e3a8a] font-extrabold text-[17px] flex items-center justify-center gap-2 hover:bg-[#eab308] transition-colors">
            <RefreshCw className="w-5 h-5" /> Rebook Trip
          </button>
        </>
      )}
    </div>
  );
};

export default RideCard;



