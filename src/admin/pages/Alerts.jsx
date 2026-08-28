import axios from "axios";
import { useEffect, useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../config/api";

const getWhatsAppLink = (phone, riderName) => {
  if (!phone) return "#";
  // Remove non-numeric characters
  let cleaned = phone.replace(/\D/g, "");
  // If local Sri Lankan number (starts with 0 and is 10 digits), convert to 94...
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "94" + cleaned.substring(1);
  }
  // Pre-filled message
  const msg = encodeURIComponent(`AccessRide EMERGENCY ALERT: Your contact ${riderName || ""} has triggered an SOS alert! Please contact them or check their status.`);
  return `https://wa.me/${cleaned}?text=${msg}`;
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "resolved"
  ).length;

  const [lastAlertCount, setLastAlertCount] = useState(0);

  const playAlertSound = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    audio.play().catch(() => {});
  };

  useEffect(() => {
    axios.get(`${API_BASE}/admin/api/alerts.php`)
      .then((res) => {
        setAlerts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Alerts initial fetch error:", err);
        setLoading(false);
      });

    const eventSource = new EventSource(`${API_BASE}/admin/api/stream.php?type=alerts`);

    eventSource.onmessage = (event) => {
      try {
        const newAlerts = JSON.parse(event.data);
        if (Array.isArray(newAlerts)) {
          const sosAlerts = newAlerts.filter(
            (alert) =>
              alert.alert_type === "sos" && alert.status !== "resolved"
          );

          setLastAlertCount((prevCount) => {
            if (sosAlerts.length > prevCount && prevCount !== 0) {
              playAlertSound();
            }
            return sosAlerts.length;
          });

          setAlerts(newAlerts);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to parse alerts stream data:", err);
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Alerts SSE connection error:", err);
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const alertStyles = {
    sos: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
    low_battery: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50",
    navigation: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    driver_emergency: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
    system: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-700",
  };

  const resolveAlert = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/admin/api/alerts.php?id=${id}`
      );

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? { ...alert, status: "resolved" }
            : alert
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm">

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Alerts Management
          </h1>

          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Monitor emergency and system alerts in real time
          </p>

          <p className="mt-2 text-red-500 dark:text-red-400 font-semibold">
            {activeAlerts} active alerts detected
          </p>
        </div>

        {/* ALERT BUTTON */}
        <button className="relative flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition">
          <Bell className="w-5 h-5" />
          Active Alerts

          {activeAlerts > 0 && (
            <span className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow animate-pulse">
              {activeAlerts}
            </span>
          )}
        </button>
      </div>

      {/* TABLE WRAPPER */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-3xl shadow-lg overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">

            {/* HEADER */}
            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Alert Type
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Message
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {/* LOADING */}
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400 dark:text-slate-500">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading alerts...
                    </div>
                  </td>
                </tr>
              ) : (

                alerts.map((alert) => {
                  const type = (alert.alert_type || "")
                    .toLowerCase()
                    .trim();

                  return (
                    <tr
                      key={alert.id}
                      className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition ${
                        alert.alert_type === "sos"
                          ? "bg-red-50/50 dark:bg-red-950/15"
                          : ""
                      }`}
                    >

                      {/* TYPE */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            alertStyles[type] ||
                            "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {alert.alert_type?.replace("_", " ")}
                        </span>
                      </td>

                      {/* MESSAGE */}
                      <td className="px-6 py-4 text-gray-650 dark:text-slate-350">
                        <div className="font-medium text-gray-800 dark:text-slate-200">{alert.message}</div>
                        {alert.latitude && alert.longitude && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-semibold">
                            <span>🗺️</span> GPS: {parseFloat(alert.latitude).toFixed(5)}, {parseFloat(alert.longitude).toFixed(5)}
                          </div>
                        )}
                        {alert.driver_name && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 border-t border-gray-100 dark:border-slate-700/40 pt-1.5">
                            <span className="font-semibold text-gray-700 dark:text-slate-300">Assigned Driver:</span>
                            <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <span>🚗 {alert.driver_name}</span>
                              {alert.driver_phone && <span className="text-gray-400">({alert.driver_phone})</span>}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* USER */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 dark:text-slate-100">
                          {alert.user_name || "Unknown"}
                        </div>
                        {alert.user_phone && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>📞</span> {alert.user_phone}
                          </div>
                        )}
                        {alert.user_location && (
                          <div className="text-xs text-slate-550 dark:text-slate-450 mt-0.5 flex items-center gap-1">
                            <span>📍</span> {alert.user_location}
                          </div>
                        )}
                        {alert.emergency_contact_name && (
                          <div className="text-[11px] text-red-600 dark:text-red-400 mt-2 border-t border-gray-100 dark:border-slate-700/40 pt-1.5 font-semibold">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">SOS Contact</p>
                            👤 {alert.emergency_contact_name} 
                            {alert.emergency_contact_phone && (
                              <>
                                <span className="text-slate-500 font-normal"> ({alert.emergency_contact_phone})</span>
                                <div className="mt-1.5 flex items-center">
                                  <a
                                    href={getWhatsAppLink(alert.emergency_contact_phone, alert.user_name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm transition-all"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.59 1.97 14.12 .948 11.492.948c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.313 4.876L1.879 22.12l6.59-1.766zM17.47 15.397c-.3-.149-1.777-.878-2.076-.985-.3-.108-.52-.163-.74.163-.219.324-.851 1.082-1.042 1.298-.19.216-.382.243-.682.094-.3-.15-1.267-.467-2.415-1.492-.893-.797-1.497-1.783-1.673-2.083-.176-.3-.019-.462.13-.611.135-.134.302-.351.453-.527.15-.176.2-.303.3-.505.099-.202.049-.379-.025-.528-.075-.15-.74-1.784-1.013-2.44-.267-.643-.539-.556-.738-.566-.19-.01-.409-.012-.628-.012-.22 0-.576.082-.878.411-.3.33-1.157 1.132-1.157 2.76 0 1.629 1.185 3.202 1.349 3.422.164.22 2.33 3.559 5.645 4.992.788.341 1.402.545 1.88.697.791.251 1.512.215 2.08.13.634-.094 1.777-.726 2.027-1.43.25-.704.25-1.307.175-1.43-.075-.124-.298-.199-.597-.348z"/>
                                    </svg>
                                    WhatsApp Contact
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            alert.status === "resolved"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {alert.status !== "resolved" && (alert.driver_id || (alert.latitude && alert.longitude)) ? (
                            <button
                              onClick={() =>
                                navigate("/admin/navigation", {
                                  state: {
                                    alertId: alert.id,
                                    driverId: alert.driver_id || null,
                                    latitude: alert.latitude || null,
                                    longitude: alert.longitude || null,
                                  },
                                })
                              }
                              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-xs font-semibold transition animate-pulse"
                            >
                              Track
                            </button>
                          ) : alert.driver_id && (
                            <button
                              disabled
                              className="inline-flex items-center gap-2 bg-gray-100 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 px-3 py-2 rounded-lg text-xs font-semibold cursor-not-allowed border border-gray-200 dark:border-slate-650"
                            >
                              Track Cancelled
                            </button>
                          )}
                          {alert.status !== "resolved" && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="inline-flex items-center gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-xs font-semibold transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;