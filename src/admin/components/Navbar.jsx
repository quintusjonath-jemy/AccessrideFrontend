import { Bell, AlertTriangle, Car, User } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LiveClock from "./LiveClock";

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

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost/admin/api/alerts.php");

      setNotifications(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      console.log(err);
    }
  };

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
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-100 px-4 py-2 rounded-lg outline-none w-80"
      />

      {/* NOTIFICATION */}
      <div className="flex items-center gap-5">
        <div ref={dropdownRef} className="relative">
          {/* NOTIFICATION BELL */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <Bell size={22} className="text-black" />

            {notifications.filter((n) => n.is_read == 0).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notifications.filter((n) => n.is_read == 0).length}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border z-50">
              <div className="p-4 border-b">
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-gray-500">No notifications</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between">
                        <p
                          className={`font-semibold ${
                            item.type === "SOS"
                              ? "text-red-600"
                              : item.type === "Ride"
                                ? "text-blue-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {item.type === "SOS" ? (
                            <AlertTriangle className="text-red-500" />
                          ) : item.type === "Ride" ? (
                            <Car className="text-blue-500" />
                          ) : (
                            <User className="text-yellow-500" />
                          )}
                        </p>

                        <span className="text-xs text-gray-400">
                          {item.created_at}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 text-center">
                <Link to="/alerts" className="text-blue-600 font-medium">
                  View All Alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* CLOCK */}
          <LiveClock />

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition">
            <img
              src={
                admin.profile_image
                  ? `http://localhost/admin/uploads/${admin.profile_image}`
                  : "https://via.placeholder.com/150"
              }
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />

            <div>
              <h4 className="font-semibold text-gray-800">{admin.name}</h4>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-3"
              >
                ...
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                  <Link
                    to="/settings/profile"
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    Settings
                  </Link>

                  <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
