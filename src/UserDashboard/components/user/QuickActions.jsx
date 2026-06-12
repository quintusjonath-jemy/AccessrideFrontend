import { Car, ClipboardList, ShieldAlert } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="mx-5 mt-5 space-y-4">
      <button
        className="
        w-full
        bg-[#0B2F89]
        text-white
        rounded-2xl
        p-5
        flex
        items-center
        gap-4
      "
      >
        <Car size={28} />
        <span className="font-semibold">Book a Ride</span>
      </button>

      <button
        className="
        w-full
        bg-white
        rounded-2xl
        p-5
        flex
        items-center
        gap-4
        shadow
      "
      >
        <ClipboardList size={28} />
        <span className="font-semibold">My Rides</span>
      </button>

      <button
        className="
        w-full
        bg-red-600
        text-white
        rounded-2xl
        p-5
        flex
        items-center
        gap-4
      "
      >
        <ShieldAlert size={28} />
        <span className="font-semibold">Emergency SOS</span>
      </button>
    </div>
  );
}

export default QuickActions;
