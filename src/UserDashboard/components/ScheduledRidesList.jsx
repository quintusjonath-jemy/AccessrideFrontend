import { Calendar, MapPin, XCircle, Car, Edit3 } from "lucide-react";

const ScheduledRidesList = ({ rides = [], onCancel, onEdit }) => {
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options = { 
        weekday: "short", 
        month: "short", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit", 
        hour12: true 
      };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="font-bold text-base text-[#0B2F89]">No Scheduled Rides</h3>
        <p className="text-gray-400 text-xs mt-1 max-w-[200px] mx-auto leading-relaxed">
          You don't have any upcoming scheduled rides at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
        <div key={ride.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-[#0B2F89] rounded-xl shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B2F89]">
                  {formatDateTime(ride.ride_date)}
                </p>
                {(ride.vehicle_type || (ride.wheelchair_type && ride.wheelchair_type !== "none")) && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full w-max mt-1.5 capitalize">
                    <span>
                      {(() => {
                        const type = (ride.vehicle_type || "").toLowerCase();
                        if (type.includes("bike") || type.includes("motorcycle")) return "🏍️";
                        if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) return "🛺";
                        if (type.includes("van") || type.includes("suv")) return "🚐";
                        return "🚗";
                      })()}
                    </span>
                    <span>
                      {ride.vehicle_type || ride.wheelchair_type}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(ride)}
                  className="text-gray-400 hover:text-blue-500 transition cursor-pointer p-1 rounded-lg hover:bg-blue-50"
                  title="Edit schedule"
                >
                  <Edit3 size={18} />
                </button>
              )}
              <button
                onClick={() => onCancel(ride.id)}
                className="text-gray-400 hover:text-red-500 transition cursor-pointer p-1 rounded-lg hover:bg-red-50"
                title="Cancel schedule"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-50 pt-3">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="text-slate-600 font-medium flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold mr-1">From:</span>
                <span className="truncate">
                  {ride.pickup_location ? ride.pickup_location.replace(/\s*\(Vehicle:\s*[^\)]+\)/i, "") : ""}
                </span>
                {(() => {
                  const match = ride.pickup_location?.match(/\(Vehicle:\s*([^\)]+)\)/i);
                  if (match) {
                    const type = match[1].trim().toLowerCase();
                    let emoji = "🚗";
                    if (type.includes("bike") || type.includes("motorcycle")) emoji = "🏍️";
                    else if (type.includes("van") || type.includes("suv")) emoji = "🚐";
                    else if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) emoji = "🛺";
                    return (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold gap-1 border border-blue-100 shrink-0">
                        {emoji} {match[1]}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={10} className="text-red-500 mt-1 shrink-0" />
              <p className="text-slate-600 font-bold truncate">
                <span className="text-gray-400 text-[10px] uppercase font-bold mr-1">To:</span>
                {ride.dropoff_location}
              </p>
            </div>
          </div>

          {/* Details Row (Distance, Fare & Payment) */}
          <div className="flex justify-between items-center text-[10px] bg-slate-50 rounded-2xl p-3 border border-slate-100/50 text-slate-500">
            {ride.distance_km && (
              <div>
                <span className="font-bold text-gray-400 uppercase mr-1">Dist:</span>
                <span className="font-extrabold text-slate-800">{parseFloat(ride.distance_km).toFixed(1)} km</span>
              </div>
            )}
            {ride.fare && (
              <div>
                <span className="font-bold text-gray-400 uppercase mr-1">Fare:</span>
                <span className="font-extrabold text-slate-800">Rs. {parseFloat(ride.fare).toFixed(2)}</span>
              </div>
            )}
            {ride.payment_method && (
              <div>
                <span className="font-bold text-gray-400 uppercase mr-1">Pay:</span>
                <span className="font-black text-[#0B2F89] capitalize">{ride.payment_method}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledRidesList;
