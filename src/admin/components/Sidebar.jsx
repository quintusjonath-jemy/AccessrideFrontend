import {
  FaHome,
  FaUsers,
  FaBell,
  FaMapMarkerAlt,
  FaCog,
  FaSignOutAlt,
  FaCar,
  FaRoad,
  FaCreditCard,
} from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [admin, setAdmin] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")
      .then((res) => {
        setAdmin(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const fetchAlerts = () => {
      axios
        .get("http://localhost/admin/api/alerts.php")
        .then((res) => {
          const alerts = Array.isArray(res.data) ? res.data : [];
          const activeCount = alerts.filter(
            (alert) => alert.status !== "resolved"
          ).length;
          setUnreadCount(activeCount);
        })
        .catch((err) => console.log(err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);
  const menuClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
    ${
      isActive
        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg font-semibold"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="w-72 bg-[#0F172A] dark:bg-slate-950 text-white min-h-screen flex flex-col justify-between shadow-2xl transition-colors duration-250">
      {/* Logo Section */}

      <div>
        <div className="p-6 border-b border-slate-700 dark:border-slate-800">
          <h1 className="text-3xl font-extrabold">
            <span className="text-yellow-400">Access</span>
            <span className="text-white">Ride</span>
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Blind Assistance Dashboard
          </p>
        </div>

        {/* Navigation */}

        <nav className="p-4">
          <p className="text-xs uppercase text-gray-500 mb-3 px-3 tracking-wider">
            Main Menu
          </p>

          <ul className="space-y-2">
            <li>
              <NavLink to="/" className={menuClass} end>
                <FaHome size={18} />
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/users" className={menuClass}>
                <FaUsers size={18} />
                Users
              </NavLink>
            </li>

            <li>
              <NavLink to="/drivers" className={menuClass}>
                <FaCar size={18} />
                Drivers
              </NavLink>
            </li>

            <li>
              <NavLink to="/rides" className={menuClass}>
                <FaRoad size={18} />
                Rides
              </NavLink>
            </li>

            <li>
              <NavLink to="/payments" className={menuClass}>
                <FaCreditCard size={18} />
                Payments
              </NavLink>
            </li>

            <li>
              <NavLink to="/navigation" className={menuClass}>
                <FaMapMarkerAlt size={18} />
                Navigation
              </NavLink>
            </li>

            <li>
              <NavLink to="/alerts" className={menuClass}>
                <FaBell size={18} />
                <span className="flex-1 flex justify-between items-center">
                  Alerts
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          </ul>

          {/* Settings Group */}

          <p className="text-xs uppercase text-gray-500 mt-8 mb-3 px-3 tracking-wider">
            System
          </p>

          <ul>
            <li>
              <NavLink to="/settings" className={menuClass}>
                <FaCog size={18} />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Footer */}

      <div className="p-4 border-t border-slate-700 dark:border-slate-800">
        {/* Admin Profile */}

        <div className="flex items-center gap-3 bg-slate-800 dark:bg-slate-900/60 p-3 rounded-xl mb-4">
          <img
            src={
              admin.profile_image
                ? `http://localhost/admin/uploads/${admin.profile_image}`
                : "https://via.placeholder.com/150"
            }
            alt="Admin"
            className="w-12 h-12 rounded-full"
          />

          <div>
            <h4 className="font-semibold">Administrator</h4>

            <p className="text-xs text-gray-400">System Manager</p>
          </div>
        </div>

        {/* Logout */}

        <button className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
