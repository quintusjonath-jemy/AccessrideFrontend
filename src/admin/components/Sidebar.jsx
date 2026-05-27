import {
  FaHome,
  FaUsers,
  FaBell,
  FaMapMarkerAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-[#111827] text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold text-yellow-400 mb-10">AccessRide</h1>

      <ul className="space-y-4">
        <Link to="/">
          <li className="flex items-center gap-3 bg-yellow-400 text-black p-3 rounded-lg cursor-pointer">
            <FaHome />
            Dashboard
          </li>
        </Link>

        <Link to="/users">
          <li className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded-lg cursor-pointer">
            <FaUsers />
            Users
          </li>
        </Link>

        <li className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded-lg cursor-pointer">
          <FaMapMarkerAlt />
          Navigation
        </li>

        <li className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded-lg cursor-pointer">
          <FaBell />
          Alerts
        </li>

        <li className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded-lg cursor-pointer">
          <FaCog />
          Settings
        </li>
      </ul>

      <div className="absolute bottom-5">
        <button className="flex items-center gap-3 text-red-500">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
