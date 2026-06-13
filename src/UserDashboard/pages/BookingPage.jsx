import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, Car } from "lucide-react";

import VehicleSelection from "../components/VehicleSelection";
import LocationInputs from "../components/LocationInputs";
import RideOptionsList from "../components/RideOptionsList";
import PaymentSelection from "../components/PaymentSelection";

const BookingPage = () => {
  const navigate = useNavigate();

  // Multi-step state: 1 = vehicle selection, 2 = route/class selection
  const [step, setStep] = useState(1);

  // Booking details states
  const [vehicleType, setVehicleType] = useState("");
  const [pickup, setPickup] = useState("My Current Location (Central Library)");
  const [dropoff, setDropoff] = useState("Central Medical Plaza");
  const [rideClass, setRideClass] = useState("eco");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  const handleSelectVehicle = (type) => {
    setVehicleType(type);
    // Auto-select corresponding tier class
    if (type === "car") {
      setRideClass("eco");
    } else if (type === "van") {
      setRideClass("assist");
    } else if (type === "three wheeler") {
      setRideClass("auto");
    } else if (type === "bike") {
      setRideClass("moto");
    }
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleConfirmBooking = () => {
    setIsBookingInProgress(true);
    
    // Simulate booking dispatch API call
    setTimeout(() => {
      setIsBookingInProgress(false);
      // Navigate to the active ride tracking page
      navigate("/user/ride");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white shadow-sm mb-4">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate("/user/dashboard"))}
            className="text-[#0B2F89] hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          
          <h1 className="text-lg font-bold text-[#0B2F89]">
            {step === 1 ? "Choose Vehicle" : "Book a Ride"}
          </h1>
          
          <button className="text-[#0B2F89]">
            <UserCircle size={28} />
          </button>
        </header>

        {/* Multi-step Flow */}
        <div className="px-5 space-y-6">
          {step === 1 ? (
            <VehicleSelection
              selectedType={vehicleType}
              onSelect={handleSelectVehicle}
              onContinue={() => setStep(2)}
            />
          ) : (
            <>
              {/* Selected Vehicle Summary */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B2F89] text-white rounded-lg">
                    <Car size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Vehicle Selection</p>
                    <p className="text-xs font-bold text-[#0B2F89] mt-0.5 capitalize">
                      {vehicleType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Step 2: Pickup/Dropoff Location Inputs */}
              <LocationInputs
                pickup={pickup}
                dropoff={dropoff}
                onChangePickup={setPickup}
                onChangeDropoff={setDropoff}
                onSwap={handleSwapLocations}
              />

              {/* Step 3: Ride Class Selection */}
              <RideOptionsList
                selectedClass={rideClass}
                onSelectClass={setRideClass}
                vehicleType={vehicleType}
              />

              {/* Step 4: Payment Selection */}
              <PaymentSelection
                paymentMethod={paymentMethod}
                onChangePayment={setPaymentMethod}
              />
            </>
          )}
        </div>
      </div>

      {/* Booking Confirmation / CTA at bottom of Step 2 */}
      {step === 2 && (
        <div className="px-5 mt-6">
          <button
            onClick={handleConfirmBooking}
            disabled={isBookingInProgress || !pickup || !dropoff}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow transition cursor-pointer text-center flex items-center justify-center gap-2 ${
              isBookingInProgress || !pickup || !dropoff
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#FEC329] text-slate-900 hover:bg-yellow-500"
            }`}
          >
            {isBookingInProgress ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Confirming Ride...</span>
              </>
            ) : (
              <span>Confirm Booking</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
