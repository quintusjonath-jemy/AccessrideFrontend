import { useState } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import LocationInputs from "./LocationInputs";
import VehicleSelection from "./VehicleSelection";

const ScheduleForm = ({ onScheduleAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Vehicle selection, Step 2: Date, Time & Route
  const [vehicleType, setVehicleType] = useState("");
  const [pickup, setPickup] = useState("My Current Location (Central Library)");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff || !date || !time) return;

    setIsScheduling(true);

    // Simulate API call to schedule ride
    setTimeout(() => {
      setIsScheduling(false);
      
      const newRide = {
        id: Date.now(),
        ride_date: `${date} ${time}`,
        pickup_location: pickup,
        dropoff_location: dropoff,
        status: "scheduled",
        vehicle_type: vehicleType,
        fare: 250, // Mock fare
      };

      onScheduleAdded(newRide);
      
      // Reset form
      setStep(1);
      setVehicleType("");
      setDropoff("");
      setDate("");
      setTime("");
    }, 1500);
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 shadow-sm">
      {step === 1 ? (
        <VehicleSelection
          selectedType={vehicleType}
          onSelect={setVehicleType}
          onContinue={() => setStep(2)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-extrabold text-[#0B2F89] text-base">Route & Time</h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
            >
              Back to Vehicle
            </button>
          </div>

          {/* Location Inputs */}
          <LocationInputs
            pickup={pickup}
            dropoff={dropoff}
            onChangePickup={setPickup}
            onChangeDropoff={setDropoff}
            onSwap={handleSwapLocations}
          />

          {/* Date and Time Picker Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date Picker */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-2">
              <Calendar size={18} className="text-[#0B2F89] shrink-0" />
              <div className="flex-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs font-semibold text-[#0B2F89] outline-none bg-transparent cursor-pointer mt-0.5"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-2">
              <Clock size={18} className="text-[#0B2F89] shrink-0" />
              <div className="flex-1">
                <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full text-xs font-semibold text-[#0B2F89] outline-none bg-transparent cursor-pointer mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Note Box */}
          <div className="flex items-start gap-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-slate-600 text-xs">
            <AlertCircle size={16} className="text-[#0B2F89] mt-0.5 shrink-0" />
            <p className="leading-normal">
              Scheduled rides can be cancelled at no cost up to 1 hour before the pickup time.
            </p>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isScheduling || !pickup || !dropoff || !date || !time}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center flex items-center justify-center gap-2 ${
              isScheduling || !pickup || !dropoff || !date || !time
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
            }`}
          >
            {isScheduling ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Scheduling Ride...</span>
              </>
            ) : (
              <span>Schedule Ride</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ScheduleForm;
