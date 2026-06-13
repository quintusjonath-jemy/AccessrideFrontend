import { Calendar, Home, User } from "lucide-react";

const BottomNavigation = () => {
  return (
    <div
      className="
      fixed
      bottom-0
      left-0
      right-0
      bg-white
      border-t
      flex
      justify-around
      py-3
      shadow-lg
    "
    >
      <button className="flex flex-col items-center text-yellow-500">
        <Home size={22} />
        <span className="text-xs">Home</span>
      </button>

      <button className="flex flex-col items-center">
        <Calendar size={22} />
        <span className="text-xs">Schedule</span>
      </button>

      <button className="flex flex-col items-center">
        <User size={22} />
        <span className="text-xs">Profile</span>
      </button>
    </div>
  );
}

export default BottomNavigation;
