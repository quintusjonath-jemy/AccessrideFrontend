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
  FaCoins,
} from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
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
        ? "bg-[#FEC329] text-slate-900 shadow-sm font-bold"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <aside className="w-72 bg-[#F1F5F9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col justify-between shadow-md border-r border-slate-200 dark:border-slate-800 transition-colors duration-250">
      {/* Logo Section */}

      <div>
        <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-extrabold">
            <span className="text-[#FEC329]">Access</span>
            <span className="text-[#0B2F89] dark:text-white">Ride</span>
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Blind Assistance Dashboard
          </p>
        </div>

        {/* Navigation */}

        <nav className="p-4">
          <p className="text-xs uppercase text-slate-400 dark:text-slate-500 mb-3 px-3 tracking-wider">
            Main Menu
          </p>

          <ul className="space-y-2">
            <li>
              <NavLink to="/admin" className={menuClass} end>
                <FaHome size={18} />
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/users" className={menuClass}>
                <FaUsers size={18} />
                Users
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/drivers" className={menuClass}>
                <FaCar size={18} />
                Drivers
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/rides" className={menuClass}>
                <FaRoad size={18} />
                Rides
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/payments" className={menuClass}>
                <FaCreditCard size={18} />
                Payments
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/earnings" className={menuClass}>
                <FaCoins size={18} />
                Earnings
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/navigation" className={menuClass}>
                <FaMapMarkerAlt size={18} />
                Navigation
              </NavLink>
            </li>

            <li>
              <NavLink to="/admin/alerts" className={menuClass}>
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

          <p className="text-xs uppercase text-slate-400 dark:text-slate-500 mt-8 mb-3 px-3 tracking-wider">
            System
          </p>

          <ul>
            <li>
              <NavLink to="/admin/settings" className={menuClass}>
                <FaCog size={18} />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Footer */}

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        {/* Admin Profile */}

        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl mb-4">
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
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Administrator</h4>

            <p className="text-xs text-slate-500">System Manager</p>
          </div>
        </div>

        {/* Logout */}

        <button 
          onClick={() => navigate("/admin-login")}
          className="w-full flex items-center justify-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/10 py-3 rounded-xl font-semibold transition-all duration-300"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
