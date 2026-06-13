import { useNavigate } from "react-router-dom";
import { Car, Calendar, Asterisk } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-5 mt-5 flex flex-col gap-4">
      {/* Book a Ride */}
      <button
        onClick={() => navigate("/user/ride")}
        className="w-full bg-[#0B2F89] hover:bg-[#082366] text-white rounded-2xl p-5 shadow-sm transition flex items-center gap-4 text-left cursor-pointer"
      >
        <div className="p-2.5 bg-white/10 rounded-xl">
          <Car size={28} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-wide">Book a Ride</span>
      </button>

      {/* My Rides */}
      <button
        onClick={() => navigate("/user/dashboard")}
        className="w-full bg-white hover:bg-slate-50 text-[#0B2F89] border border-slate-100 rounded-2xl p-5 shadow-sm transition flex items-center gap-4 text-left cursor-pointer"
      >
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <Calendar size={28} className="text-[#0B2F89]" />
        </div>
        <span className="font-bold text-lg tracking-wide">My Rides</span>
      </button>

      {/* Emergency SOS */}
      <button
        onClick={() => navigate("/user/sos")}
        className="w-full bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-2xl p-5 shadow-sm transition flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Asterisk size={28} className="text-white stroke-[3px]" />
          </div>
          <span className="font-bold text-lg tracking-wide">Emergency SOS</span>
        </div>
        <span className="bg-white text-[#B91C1C] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Urgent
        </span>
      </button>
    </div>
  );
};

export default QuickActions;
