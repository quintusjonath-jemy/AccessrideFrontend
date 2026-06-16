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
  MapPinned,
  Check,
  Trash2,
  UserCheck,
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
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({
    users: [],
    drivers: [],
    rides: [],
  });
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")
      .then((res) => {
        setAdmin(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults({ users: [], drivers: [], rides: [] });
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `http://localhost/admin/api/search.php?q=${search}`,
        );

        setResults(res.data);
        setShowSearch(true);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost/admin/api/notifications.php");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost/admin/api/notifications.php?id=${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: "1" } : n))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost/admin/api/notifications.php?read_all=1");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: "1" })));
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost/admin/api/notifications.php?id=${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr.replace(/-/g, "/"));
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

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
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40 transition-colors duration-200">
      {/* Search */}

      <div className="relative w-[420px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowSearch(true)}
          placeholder="Search users, drivers, rides..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {showSearch && search && (
          <div className="absolute top-14 left-0 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            {/* USERS */}
            <div className="p-3 border-b dark:border-slate-700">
              <p className="text-xs text-gray-400 mb-2">Users</p>
              {results.users?.length > 0 ? (
                results.users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg"
                  >
                    <User size={16} />
                    <span className="text-sm">{u.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No users found</p>
              )}
            </div>

            {/* DRIVERS */}
            <div className="p-3 border-b dark:border-slate-700">
              <p className="text-xs text-gray-400 mb-2">Drivers</p>
              {results.drivers?.length > 0 ? (
                results.drivers.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg"
                  >
                    <Car size={16} />
                    <span className="text-sm">{d.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No drivers found</p>
              )}
            </div>

            {/* RIDES */}
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-2">Rides</p>
              {results.rides?.length > 0 ? (
                results.rides.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-lg"
                  >
                    <MapPinned size={16} />
                    <span className="text-sm">
                      {r.pickup_location} → {r.dropoff_location}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No rides found</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div ref={dropdownRef} className="flex items-center gap-5">
        {/* Clock */}

        <div className="hidden lg:block">
          <LiveClock />
        </div>        {/* Notifications */}

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 transition"
          >
            <Bell size={20} />

            {notifications.filter((n) => n.is_read == 0).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                {notifications.filter((n) => n.is_read == 0).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[400px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-850 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">
                    Notifications
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                    Latest system updates
                  </p>
                </div>
                {notifications.filter((n) => n.is_read == 0).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400 font-semibold transition bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/40 px-3 py-1.5 rounded-lg"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                {notifications.length === 0 ? (
                  <p className="p-6 text-gray-500 dark:text-slate-400 text-center text-sm">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((item) => {
                    const isUnread = item.is_read == 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 transition flex gap-3 relative group ${
                          isUnread
                            ? "bg-yellow-50/20 hover:bg-yellow-50/40 dark:bg-yellow-950/10 dark:hover:bg-yellow-950/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        {/* Icon */}
                        <div className="mt-0.5">
                          {item.type === "SOS" ? (
                            <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-xl">
                              <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                            </div>
                          ) : item.type === "Alert" ? (
                            <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-xl">
                              <AlertTriangle size={18} className="text-orange-500" />
                            </div>
                          ) : item.type === "Ride" ? (
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                              <Car size={18} className="text-blue-500" />
                            </div>
                          ) : item.type === "Driver" ? (
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl">
                              <UserCheck size={18} className="text-purple-500" />
                            </div>
                          ) : (
                            <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-xl">
                              <User size={18} className="text-green-500" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pr-16">
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200 leading-snug">
                            {item.message}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                item.type === "SOS"
                                  ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                                  : item.type === "Alert"
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                                    : item.type === "Ride"
                                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                                      : item.type === "Driver"
                                        ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                                        : "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-slate-400">
                              {formatRelativeTime(item.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Actions overlay */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition duration-150">
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(item.id)}
                              title="Mark as read"
                              className="p-1.5 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 shadow-sm transition"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            title="Delete"
                            className="p-1.5 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 shadow-sm transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Blue unread dot indicator */}
                        {isUnread && (
                          <span className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full group-hover:scale-0 transition duration-150"></span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 text-center bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-700">
                <Link
                  to="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="text-yellow-600 dark:text-yellow-500 font-semibold text-sm hover:text-yellow-700 dark:hover:text-yellow-400 transition"
                >
                  View All Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}

        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl px-3 py-2 transition"
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
              <h4 className="font-semibold text-gray-800 dark:text-slate-200">
                {admin.name || "Administrator"}
              </h4>

              <p className="text-xs text-gray-500 dark:text-slate-400">System Administrator</p>
            </div>

            <ChevronDown size={16} className="text-gray-600 dark:text-slate-400" />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
              {/* Profile */}
              <Link
                to="/settings/profile"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <UserCircle size={18} className="text-gray-500 dark:text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">My Profile</span>
                  <span className="text-xs text-gray-400 dark:text-slate-400">
                    View account details
                  </span>
                </div>
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition border-t border-gray-100 dark:border-slate-700"
              >
                <Settings size={18} className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Settings</span>
                  <span className="text-xs text-gray-400">
                    System preferences
                  </span>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  setOpenMenu(false);
                  // your logout logic here
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition border-t border-gray-100 dark:border-slate-700"
              >
                <LogOut size={18} />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">Logout</span>
                  <span className="text-xs text-red-400 dark:text-red-500">
                    Sign out of your account
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
