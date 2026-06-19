import { Car, Truck, Zap, Bike, Sparkles } from "lucide-react";

const RideOptionsList = ({ selectedClass, onSelectClass, vehicleType }) => {
  const getOptionsForVehicle = () => {
    switch (vehicleType) {
      case "van":
        return [
          {
            id: "assist",
            title: "AccessRide Van / WAV",
            price: "Rs. 240",
            eta: "8 mins away",
            desc: "Spacious van with ramp/lift and assist certified driver.",
            icon: Truck,
          },
        ];
      case "three wheeler":
        return [
          {
            id: "auto",
            title: "AccessRide Auto",
            price: "Rs. 120",
            eta: "6 mins away",
            desc: "Open-air auto-rickshaw. Ideal for short quick trips.",
            icon: Zap,
          },
        ];
      case "bike":
        return [
          {
            id: "moto",
            title: "AccessRide Moto",
            price: "Rs. 80",
            eta: "3 mins away",
            desc: "Fast single-passenger motorcycle ride.",
            icon: Bike,
          },
        ];
      case "car":
      default:
        return [
          {
            id: "eco",
            title: "AccessRide Eco",
            price: "Rs. 180",
            eta: "5 mins away",
            desc: "Standard sedan for comfortable everyday trips.",
            icon: Car,
          },
        ];
    }
  };

  const options = getOptionsForVehicle();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-extrabold text-[#0B2F89] text-base mb-1">Select Ride Option</h3>
      
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedClass === opt.id;
        
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectClass(opt.id)}
            className={`w-full text-left rounded-2xl p-4 border transition flex items-center justify-between cursor-pointer ${
              isSelected
                ? "border-[#0B2F89] bg-blue-50/30 ring-2 ring-[#0B2F89]/10 shadow-sm"
                : "border-slate-100 bg-white hover:bg-slate-50 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isSelected ? "bg-[#0B2F89] text-white" : "bg-slate-100 text-[#0B2F89]"
                }`}
              >
                <Icon size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2F89]">{opt.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{opt.eta}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="font-bold text-[#0B2F89] text-base">{opt.price}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RideOptionsList;
