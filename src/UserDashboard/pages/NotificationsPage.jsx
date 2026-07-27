import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Trash2, Check, Inbox } from "lucide-react";
import axios from "axios";
import API_BASE from "../../config/api";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/UserDashboard/api/notifications.php?user_id=${userId}`
      );
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await axios.put(
        `${API_BASE}/UserDashboard/api/notifications.php`,
        { id }
      );
      if (res.data?.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      const res = await axios.put(
        `${API_BASE}/UserDashboard/api/notifications.php?read_all=1&user_id=${userId}`
      );
      if (res.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering card click
    try {
      const res = await axios.delete(
        `${API_BASE}/UserDashboard/api/notifications.php?id=${id}`
      );
      if (res.data?.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans w-full">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-x-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 bg-white shadow-sm mb-4 sticky top-0 z-50">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="text-[#0B2F89] hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          
          <h1 className="text-lg font-bold text-[#0B2F89]">Notifications</h1>
          
          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0 || notifications.every(n => n.is_read)}
            className={`text-xs font-semibold cursor-pointer transition ${
              notifications.length === 0 || notifications.every(n => n.is_read)
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-500 hover:text-[#0B2F89]"
            }`}
          >
            Mark all read
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-5 pb-5 flex flex-col gap-4 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
              <div className="p-4 bg-slate-100 rounded-full mb-4 text-[#0B2F89]">
                <Inbox size={40} />
              </div>
              <p className="text-base font-extrabold text-slate-500">No Notifications</p>
              <p className="text-xs text-slate-400 mt-1">We'll let you know when something comes up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 cursor-pointer flex gap-4 ${
                    notif.is_read
                      ? "bg-white border-slate-100 opacity-75 hover:opacity-100"
                      : "bg-white border-blue-200 ring-1 ring-blue-100 hover:shadow-md animate-fade-in-up"
                  }`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Status Indicator */}
                  {!notif.is_read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#FEC329] rounded-full animate-pulse"></span>
                  )}

                  {/* Bell Icon Wrapper */}
                  <div className={`p-2.5 rounded-xl shrink-0 h-fit ${
                    notif.is_read 
                      ? "bg-slate-100 text-slate-400" 
                      : "bg-blue-50 text-[#0B2F89]"
                  }`}>
                    <Bell size={20} />
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className={`text-[15px] leading-snug truncate ${
                      notif.is_read ? "font-semibold text-slate-700" : "font-extrabold text-[#0B2F89]"
                    }`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-2">
                      {new Date(notif.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center justify-between shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    {!notif.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                        }}
                        className="p-1 rounded-full bg-slate-50 hover:bg-green-50 text-slate-400 hover:text-green-600 transition cursor-pointer"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default NotificationsPage;
