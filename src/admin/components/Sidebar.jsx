import {
  FaHome,
  FaUsers,
  FaBell,
  FaMapMarkerAlt,
  FaCog,
  FaSignOutAlt,
  FaCar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-[#111827] text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold text-yellow-400 mb-10">AccessRide</h1>

      <ul className="space-y-4">
        <li className="list-none">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaHome />

            <span>Dashboard</span>
          </NavLink>
        </li>

        <li className="list-none">
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaUsers />

            <span>Users</span>
          </NavLink>
        </li>

        <li className="list-none">
          <NavLink
            to="/drivers"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaCar />

            <span>Drivers</span>
          </NavLink>
        </li>

        <li className="list-none">
          <NavLink
            to="/navigation"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaMapMarkerAlt />

            <span>Navigation</span>
          </NavLink>
        </li>

        <li className="list-none">
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaCar />

            <span>Alerts</span>
          </NavLink>
        </li>

       <li className="list-none">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-black font-semibold"
                  : "hover:bg-gray-800"
              }`
            }
          >
            <FaCog />

            <span>Settings</span>
          </NavLink>
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
