import axios from "axios";
import { useEffect, useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    audio.play();
  };

  useEffect(() => {
    const fetchAlerts = () => {
      axios
        .get("http://localhost/admin/api/alerts.php")
        .then((res) => {
          const newAlerts = Array.isArray(res.data) ? res.data : [];

          const sosAlerts = newAlerts.filter(
            (alert) =>
              alert.alert_type === "sos" && alert.status !== "resolved"
          );

          if (sosAlerts.length > lastAlertCount && lastAlertCount !== 0) {
            playAlertSound();
          }

          setLastAlertCount(sosAlerts.length);
          setAlerts(newAlerts);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
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
        `http://localhost/admin/api/alerts.php?id=${id}`
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
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                        {alert.message}
                      </td>

                      {/* USER */}
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-slate-100">
                        {alert.user_name || "Unknown"}
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
                          {alert.driver_id && (
                            <button
                              onClick={() =>
                                navigate("/navigation", {
                                  state: {
                                    driverId: alert.driver_id,
                                  },
                                })
                              }
                              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-xs font-semibold transition animate-pulse"
                            >
                              Track
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