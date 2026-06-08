import {
  Bell,
  AlertTriangle,
  Car,
  User,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LiveClock from "./LiveClock";
import { useCallback } from "react";

const Navbar = () => {
  const [admin, setAdmin] = useState({});
  const [openMenu, setOpenMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")
      .then((res) => {
        setAdmin(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost/admin/api/alerts.php");

      setNotifications(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
      {/* Search */}

      <div className="relative w-[420px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search users, drivers, rides..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />
      </div>

      <div className="flex items-center gap-5">
        {/* Clock */}

        <div className="hidden lg:block">
          <LiveClock />
        </div>

        {/* Notifications */}

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            <Bell size={20} />

            {notifications.filter((n) => n.is_read == 0).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                {notifications.filter((n) => n.is_read == 0).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-5 text-gray-500 text-center">
                    No notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-b hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          {item.type === "SOS" ? (
                            <AlertTriangle size={20} className="text-red-500" />
                          ) : item.type === "Ride" ? (
                            <Car size={20} className="text-blue-500" />
                          ) : (
                            <User size={20} className="text-yellow-500" />
                          )}
                        </div>

                        <span className="text-xs text-gray-400">
                          {item.created_at}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{item.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 text-center border-t">
                <Link to="/alerts" className="text-blue-600 font-medium">
                  View All Alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}

        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition"
          >
            <div className="relative">
              <img
                src={
                  admin.profile_image
                    ? `http://localhost/admin/uploads/${admin.profile_image}`
                    : "https://via.placeholder.com/150"
                }
                alt="Admin"
                className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400"
              />

              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="text-left hidden md:block">
              <h4 className="font-semibold text-gray-800">
                {admin.name || "Administrator"}
              </h4>

              <p className="text-xs text-gray-500">System Administrator</p>
            </div>

            <ChevronDown size={16} />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border overflow-hidden z-50">
              <Link
                to="/settings/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <UserCircle size={18} />
                My Profile
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <Settings size={18} />
                Settings
              </Link>

              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
