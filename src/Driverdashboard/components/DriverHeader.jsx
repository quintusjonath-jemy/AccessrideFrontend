import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiBell, FiUser, FiLogOut, FiChevronDown, FiSettings } from "react-icons/fi";
import API_BASE from "../../config/api";

const DriverHeader = ({ driverInfo = {} }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const driverId = sessionStorage.getItem("driver_id");
    if (!driverId) return;

    fetch(`${API_BASE}/Driverdashboard/api/notifications.php?driver_id=${driverId}&count=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.unread_count === 'number') {
          setUnreadCount(data.unread_count);
        }
      })
      .catch(() => {}); // silently ignore if endpoint doesn't exist yet
  }, []);

  const handleLogout = () => {
    setOpenMenu(false);
    localStorage.removeItem("driver_id");
    sessionStorage.clear();
    navigate("/driver-login");
  };

  const avatarSrc = driverInfo.profile_image
    ? `${API_BASE}/admin/uploads/${driverInfo.profile_image}`
    : "/src/Driverdashboard/drivering.webp";

  return (
    <header className="flex justify-between items-center px-4 py-3.5 bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="AccessRide" className="w-8 h-8 rounded-lg shadow-sm border border-slate-100" />
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#FEC329]">Access</span>
          <span className="text-[#0B2F89]">Ride</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => navigate("/driver-notifications")}
          className="relative p-2 rounded-full hover:bg-slate-100 text-[#0B2F89] transition"
          title="Notifications"
        >
          <FiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpenMenu((v) => !v)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <img
              src={avatarSrc}
              alt="Driver avatar"
              className="h-9 w-9 rounded-full object-cover border-2 border-white shadow bg-white"
              onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
            />
            <FiChevronDown
              className={`w-3.5 h-3.5 text-[#0B2F89] transition-transform duration-200 ${openMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {openMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              {/* Driver info header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Driver Account</p>
                <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                  {driverInfo.first_name || "Driver"} {driverInfo.last_name || ""}
                </p>
                {driverInfo.email && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{driverInfo.email}</p>
                )}
              </div>

              {/* Profile Settings */}
              <Link
                to="/driver-profile"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition"
              >
                <FiSettings className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Profile Settings</p>
                  <p className="text-xs text-slate-400">View & edit your info</p>
                </div>
              </Link>

              {/* My Account (same as profile) */}
              <Link
                to="/driver-earnings"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition border-t border-slate-100"
              >
                <FiUser className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">My Account</p>
                  <p className="text-xs text-slate-400">Subscription, earnings & cards</p>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-slate-100"
              >
                <FiLogOut className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-medium">Log Out</p>
                  <p className="text-xs text-red-400">Sign out of your account</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DriverHeader;
