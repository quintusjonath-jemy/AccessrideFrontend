import { MapPin, Navigation, ArrowUpDown } from "lucide-react";

const LocationInputs = ({ pickup, dropoff, onChangePickup, onChangeDropoff, onSwap }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative flex items-center gap-3">
      {/* Visual timeline/dots line on the left */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-emerald-500" />
        </div>
        <div className="w-0.5 h-10 border-l-2 border-dotted border-slate-300" />
        <MapPin size={18} className="text-red-500" />
      </div>

      {/* Input columns */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Pickup Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pickup}
            onChange={(e) => onChangePickup(e.target.value)}
            placeholder="Pickup Location"
            className="w-full py-1 text-sm text-[#0B2F89] font-medium outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Divider line between inputs */}
        <div className="h-px bg-slate-100 w-full" />

        {/* Dropoff Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dropoff}
            onChange={(e) => onChangeDropoff(e.target.value)}
            placeholder="Where to?"
            className="w-full py-1 text-sm text-[#0B2F89] font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Swap Button */}
      <button
        type="button"
        onClick={onSwap}
        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0B2F89] transition cursor-pointer"
        title="Swap locations"
      >
        <ArrowUpDown size={18} />
      </button>
    </div>
  );
};

export default LocationInputs;
