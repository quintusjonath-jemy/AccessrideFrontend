import { Car, Truck, Zap, Bike } from "lucide-react";

const VehicleSelection = ({ selectedType, onSelect, onContinue }) => {
  const options = [
    {
      id: "car",
      title: "Car",
      desc: "Standard 4-seater vehicle for everyday comfort.",
      icon: Car,
    },
    {
      id: "van",
      title: "Van",
      desc: "Spacious vehicle, ideal for group travel or wheelchair/mobility needs.",
      icon: Truck,
    },
    {
      id: "three wheeler",
      title: "Three Wheeler",
      desc: "Open-air auto-rickshaw/tuktuk, ideal for short quick trips.",
      icon: Zap,
    },
    {
      id: "bike",
      title: "Bike",
      desc: "Single-passenger motorcycle ride for fast commuting.",
      icon: Bike,
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0B2F89] tracking-tight mb-2">
          Select Vehicle Type
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Select your preferred vehicle type to continue booking your ride.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#0B2F89] bg-blue-50/50 ring-2 ring-[#0B2F89]/15 shadow-sm"
                    : "border-slate-100 bg-white hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected ? "bg-[#0B2F89] text-white" : "bg-slate-100 text-[#0B2F89]"
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0B2F89]">{opt.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!selectedType}
        className={`w-full py-4 mt-6 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center ${
          selectedType
            ? "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default VehicleSelection;
