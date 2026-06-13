import { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import axios from "axios";
import LocationInputs from "./LocationInputs";
import VehicleSelection from "./VehicleSelection";

const ScheduleForm = ({ onScheduleAdded, onScheduleUpdated, editingRide, onCancelEdit }) => {
  const [step, setStep] = useState(1); // Step 1: Vehicle selection, Step 2: Date, Time & Route
  const [vehicleType, setVehicleType] = useState("");
  const [pickup, setPickup] = useState("My Current Location (Central Library)");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (editingRide) {
      setVehicleType(editingRide.vehicle_type || editingRide.wheelchair_type || "car");
      setPickup(editingRide.pickup_location || "");
      setDropoff(editingRide.dropoff_location || "");
      if (editingRide.ride_date) {
        const parts = editingRide.ride_date.split(" ");
        setDate(parts[0] || "");
        setTime(parts[1]?.substring(0, 5) || "");
      }
      setStep(2); // Go straight to step 2 since we already have fields pre-loaded
    } else {
      setStep(1);
      setVehicleType("");
      setPickup("My Current Location (Central Library)");
      setDropoff("");
      setDate("");
      setTime("");
    }
  }, [editingRide]);

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff || !date || !time) return;

    setIsScheduling(true);

    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

    const payload = {
      user_id: userId,
      pickup_location: pickup,
      dropoff_location: dropoff,
      ride_date: `${date} ${time}`,
      vehicle_type: vehicleType,
      fare: editingRide ? parseFloat(editingRide.fare) : 250.0
    };

    if (editingRide) {
      payload.ride_id = editingRide.id;
    }

    const apiRequest = editingRide
      ? axios.put(`http://localhost/UserDashboard/api/schedule.php?user_id=${userId}`, payload)
      : axios.post(`http://localhost/UserDashboard/api/schedule.php?user_id=${userId}`, payload);

    apiRequest
      .then(res => {
        setIsScheduling(false);
        if (res.data.success) {
          if (editingRide) {
            onScheduleUpdated({
              id: editingRide.id,
              ride_date: `${date} ${time}`,
              pickup_location: pickup,
              dropoff_location: dropoff,
              vehicle_type: vehicleType,
              fare: editingRide.fare || 250.0,
              status: "scheduled"
            });
          } else {
            onScheduleAdded({
              id: res.data.ride_id || Date.now(),
              ride_date: `${date} ${time}`,
              pickup_location: pickup,
              dropoff_location: dropoff,
              vehicle_type: vehicleType,
              fare: 250.0,
              status: "scheduled"
            });
          }

          // Reset form
          setStep(1);
          setVehicleType("");
          setDropoff("");
          setDate("");
          setTime("");
        } else {
          alert(res.data.message || "Failed to schedule ride");
        }
      })
      .catch(err => {
        setIsScheduling(false);
        console.error("Scheduling error:", err);
        alert("An error occurred. Please check database connectivity and try again.");
      });
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
              >
                Back to Vehicle
              </button>
              {editingRide && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
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
            className={`w-full py-4 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center flex items-center justify-center gap-2 ${isScheduling || !pickup || !dropoff || !date || !time
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
              }`}
          >
            {isScheduling ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>{editingRide ? "Updating Ride..." : "Scheduling Ride..."}</span>
              </>
            ) : (
              <span>{editingRide ? "Update Ride" : "Schedule Ride"}</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ScheduleForm;
