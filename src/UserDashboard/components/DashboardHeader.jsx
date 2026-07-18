import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserCircle, LogOut, Settings, ChevronDown, Bell } from "lucide-react";

const DashboardHeader = ({ user }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";
    fetch(`http://localhost/UserDashboard/api/notifications.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unread = data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch(err => console.error("Error fetching unread count:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-white shadow-sm relative">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="AccessRide" className="w-8 h-8 rounded-lg shadow-sm border border-slate-100" />
        <h1 className="text-xl font-extrabold">
          <span className="text-[#FEC329]">Access</span>
          <span className="text-[#0B2F89]">Ride</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button
          onClick={() => navigate("/user/notifications")}
          className="relative text-[#0B2F89] hover:scale-105 transition focus:outline-none cursor-pointer"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Menu */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-1 focus:outline-none cursor-pointer"
          >
            <UserCircle
              size={32}
              className="text-[#0B2F89] hover:scale-105 transition"
            />
            <ChevronDown size={14} className="text-[#0B2F89]" />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {/* Header info */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rider Account</p>
                <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{user?.name || "Rider"}</p>
                {user?.email && <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>}
              </div>

              {/* Profile Settings */}
              <Link
                to="/user/profile"
                onClick={() => setOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
              >
                <Settings size={18} className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Profile Settings</span>
                  <span className="text-xs text-gray-400">
                    Manage app preferences
                  </span>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-gray-100"
              >
                <LogOut size={18} />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">Logout</span>
                  <span className="text-xs text-red-400">
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

export default DashboardHeader;