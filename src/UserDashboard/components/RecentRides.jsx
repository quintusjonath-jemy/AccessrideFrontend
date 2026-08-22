import { useNavigate } from "react-router-dom";

function RecentRides({ rides }) {
  const navigate = useNavigate();

  return (
    <div className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-[#0B2F89]">Recent Rides</h3>
        {rides && rides.length > 0 && (
          <button
            onClick={() => navigate("/user/history")}
            className="text-xs font-bold text-[#0B2F89] hover:bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            View More
          </button>
        )}
      </div>

      {rides.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No rides found</p>
      ) : (
        rides.slice(0, 5).map((ride) => (
          <div key={ride.id} className="border-b py-3 last:border-b-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-slate-800">
                  {ride.pickup_location ? ride.pickup_location.replace(/\s*\(Vehicle:\s*[^\)]+\)/i, "") : ""}
                </p>
                {(() => {
                  let vehicleType = ride.vehicle_type;
                  if (!vehicleType) {
                    const match = ride.pickup_location?.match(/\(Vehicle:\s*([^\)]+)\)/i);
                    if (match) {
                      vehicleType = match[1];
                    }
                  }
                  if (vehicleType) {
                    const type = vehicleType.trim().toLowerCase();
                    let emoji = "🚗";
                    if (type.includes("bike") || type.includes("motorcycle")) emoji = "🏍️";
                    else if (type.includes("van") || type.includes("suv")) emoji = "🚐";
                    else if (type.includes("three") || type.includes("rickshaw") || type.includes("auto") || type.includes("tuk")) emoji = "🛺";
                    return (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold gap-1 border border-blue-100">
                        {emoji} {vehicleType}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                {ride.status}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-0.5">{ride.dropoff_location}</p>

            <p className="text-sm font-extrabold text-[#0B2F89] mt-1">Rs. {parseFloat(ride.fare).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentRides;
