import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiCreditCard, FiTruck, FiSettings, FiLoader, FiArrowLeft } from "react-icons/fi";
import DriverHeader from "./components/DriverHeader";
import API_BASE from "../config/api";

const TYPE_CONFIG = {
  payment: {
    icon: FiCreditCard,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700"
  },
  warning: {
    icon: FiAlertTriangle,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700"
  },
  success: {
    icon: FiCheckCircle,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700"
  },
  ride: {
    icon: FiTruck,
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    border: "border-l-indigo-500",
    badge: "bg-indigo-100 text-indigo-700"
  },
  system: {
    icon: FiSettings,
    bg: "bg-slate-50",
    iconColor: "text-slate-500",
    border: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-600"
  },
  info: {
    icon: FiInfo,
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "border-l-sky-500",
    badge: "bg-sky-100 text-sky-700"
  }
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const DriverNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState({ first_name: "Driver", profile_image: "" });
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all"); // all | unread

  const driverId = sessionStorage.getItem("driver_id");

  const fetchNotifications = () => {
    if (!driverId) { navigate("/driver-login"); return; }

    Promise.all([
      fetch(`${API_BASE}/Driverdashboard/api/notifications.php?driver_id=${driverId}`).then(r => r.json()),
      fetch(`${API_BASE}/Driverdashboard/api/dashboard.php?driver_id=${driverId}`).then(r => r.json())
    ]).then(([notifData, dashData]) => {
      if (notifData.success) {
        setNotifications(notifData.notifications || []);
      }
      if (dashData.success && dashData.data?.driver) {
        setDriverInfo(dashData.data.driver);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );
    await fetch(`${API_BASE}/Driverdashboard/api/notifications.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: driverId, action: "mark_read", notification_id: id })
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch(`${API_BASE}/Driverdashboard/api/notifications.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: driverId, action: "mark_all_read" })
    }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setMarkingAll(false);
  };

  const displayed = filter === "unread"
    ? notifications.filter(n => n.is_read === 0)
    : notifications;

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  return (
    <>
      <DriverHeader driverInfo={driverInfo} />

      <div className="bg-slate-50 min-h-screen pb-28">
        {/* Page Title Bar */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-[#0B2F89] flex items-center gap-2">
                <FiBell className="w-4 h-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {notifications.length} total · {unreadCount} unread
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0B2F89] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-60"
            >
              {markingAll ? <FiLoader className="animate-spin w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
              Mark All Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-2">
          {["all", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                filter === tab
                  ? "bg-[#0B2F89] text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab === "unread" ? `Unread (${unreadCount})` : "All"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-4 space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <FiLoader className="w-8 h-8 text-[#0B2F89] animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading notifications...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <FiBell className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-xs text-slate-300 font-medium text-center max-w-[200px]">
                {filter === "unread" ? "You're all caught up!" : "Subscription updates and ride alerts will appear here."}
              </p>
            </div>
          ) : (
            displayed.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => notif.is_read === 0 && markRead(notif.id)}
                  className={`relative flex gap-3 p-4 rounded-2xl border border-l-4 shadow-sm transition cursor-pointer select-none
                    ${cfg.bg} ${cfg.border}
                    ${notif.is_read === 0 ? "opacity-100" : "opacity-70"}
                  `}
                >
                  {/* Unread dot */}
                  {notif.is_read === 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 shadow-sm" />
                  )}

                  {/* Icon */}
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm ${cfg.iconColor}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-extrabold text-slate-800 leading-snug ${notif.is_read === 0 ? "" : "font-semibold"}`}>
                        {notif.title}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                      {formatTime(notif.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default DriverNotifications;
