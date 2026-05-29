import { FaBell, FaUserCircle } from "react-icons/fa";
import LiveClock from "./LiveClock";

function Navbar() {
  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-100 px-4 py-2 rounded-lg outline-none w-80"
      />

      <div className="flex items-center gap-5">
        <FaBell className="text-xl cursor-pointer" />

        <div className="flex items-center gap-2">
          <LiveClock />
          <FaUserCircle className="text-3xl" />
          <span className="font-medium">Admin</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
