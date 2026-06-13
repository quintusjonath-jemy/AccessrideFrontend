import { Mic, AudioLines } from "lucide-react";

const VoiceBookingCard = () => {
  return (
    <div className="mx-5 mt-5 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="flex justify-center relative">
        <button className="h-28 w-28 rounded-full bg-[#FEC329] flex items-center justify-center shadow-lg hover:scale-105 transition active:scale-95 ring-8 ring-yellow-400/20">
          <Mic size={38} className="text-[#0B2F89]" />
        </button>
      </div>

      <h3 className="text-center font-bold text-lg text-[#0B2F89] mt-6">
        Tap anywhere or press to speak
      </h3>

      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-3 font-medium">
        <AudioLines size={16} className="text-gray-400" />
        <span>"Booking ride to town"</span>
      </div>
    </div>
  );
};

export default VoiceBookingCard;
