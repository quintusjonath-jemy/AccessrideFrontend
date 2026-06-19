import { Calendar } from "lucide-react";

const UpcomingRideCard = ({ ride }) => {
  // Format the SQL datetime string into a user-friendly display
  const formatRideDate = (dateStr) => {
    if (!dateStr) return "Today at 4:30 PM";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options = { hour: "numeric", minute: "2-digit", hour12: true };
      const timeStr = date.toLocaleTimeString("en-US", options);
      
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return `Today at ${timeStr}`;
      }
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  const displayRide = ride || {
    ride_date: "Today at 4:30 PM",
    dropoff_location: "Central Medical Plaza",
    status: "pending"
  };

  return (
    <div className="mx-5 mt-6">
      {/* Header above card */}
      <div className="flex justify-between items-end mb-3">
        <h3 className="font-extrabold text-[#0B2F89] text-base">Your Next Ride</h3>
        <button className="text-xs font-semibold text-slate-500 hover:text-[#0B2F89] underline cursor-pointer">
          View All
        </button>
      </div>

      {/* Card body */}
      <div className="bg-[#EFEFF1] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Left: Icon in dark navy box */}
          <div className="h-12 w-12 rounded-xl bg-[#001D6E] flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-white" />
          </div>

          {/* Middle: Details */}
          <div>
            <p className="text-xs font-bold text-slate-700">
              {ride ? formatRideDate(ride.ride_date) : displayRide.ride_date}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">
              To: {displayRide.dropoff_location}
            </p>
          </div>
        </div>

        {/* Right: Details Button */}
        <button className="bg-[#FEC329] hover:bg-yellow-500 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer">
          Details
        </button>
      </div>
    </div>
  );
};

export default UpcomingRideCard;
