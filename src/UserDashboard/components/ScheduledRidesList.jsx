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
                    <Car size={10} />
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
              <p className="text-slate-600 font-medium truncate">
                <span className="text-gray-400 text-[10px] uppercase font-bold mr-1">From:</span>
                {ride.pickup_location}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={10} className="text-red-500 mt-1 shrink-0" />
              <p className="text-slate-600 font-bold truncate">
                <span className="text-gray-400 text-[10px] uppercase font-bold mr-1">To:</span>
                {ride.dropoff_location}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledRidesList;
