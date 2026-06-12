import { Mic } from "lucide-react";

const VoiceBookingCard = () => {
  return (
    <div className="mx-5 mt-5 bg-white rounded-3xl p-8 shadow">
      <div className="flex justify-center">
        <button
          className="
          h-24
          w-24
          rounded-full
          bg-yellow-400
          flex
          items-center
          justify-center
          shadow-lg
        "
        >
          <Mic size={42} />
        </button>
      </div>

      <h3 className="text-center font-bold text-lg mt-5">
        Tap anywhere or press to speak
      </h3>

      <p className="text-center text-gray-500 mt-2">
        "Book a ride to hospital"
      </p>
    </div>
  );
}

export default VoiceBookingCard;
