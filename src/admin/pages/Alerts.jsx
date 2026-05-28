import axios from "axios";
import { useEffect, useState } from "react";

import { Bell, CheckCircle } from "lucide-react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "resolved",
  ).length;

  const [lastAlertCount, setLastAlertCount] = useState(0);
  const playAlertSound = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    );

    audio.play();
  };

  // FETCH ALERTS
  useEffect(() => {
    const fetchAlerts = () => {
      axios
        .get("http://localhost/admin/api/alerts.php")

        .then((res) => {
          const newAlerts = Array.isArray(res.data) ? res.data : [];

          // CHECK NEW SOS ALERTS
          const sosAlerts = newAlerts.filter(
            (alert) =>
              alert.alert_type === "sos" && alert.status !== "resolved",
          );

          if (sosAlerts.length > lastAlertCount && lastAlertCount !== 0) {
            playAlertSound();
          }

          setLastAlertCount(sosAlerts.length);

          setAlerts(newAlerts);

          setLoading(false);
        })

        .catch((err) => {
          console.log(err);

          setLoading(false);
        });
    };

    // FIRST LOAD
    fetchAlerts();

    // AUTO REFRESH EVERY 5 SECONDS
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    // CLEANUP
    return () => clearInterval(interval);
  }, []);

  // ALERT COLORS
  const alertStyles = {
    sos: "bg-red-100 text-red-600",

    low_battery: "bg-yellow-100 text-yellow-600",

    navigation: "bg-blue-100 text-blue-600",

    driver_emergency: "bg-orange-100 text-orange-600",

    system: "bg-gray-100 text-gray-600",
  };

  // RESOLVE ALERT
  const resolveAlert = async (id) => {
    try {
      await axios.put(`http://localhost/admin/api/alerts.php?id=${id}`);

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, status: "resolved" } : alert,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">
            Alerts Management
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor emergency and system alerts
          </p>

          <p className="text-red-500 font-semibold mt-2">
            {activeAlerts} active alerts detected
          </p>
        </div>

        <button className="relative flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition">
          <Bell className="w-5 h-5" />
          Active Alerts
          {/* Notification Badge */}
          {activeAlerts > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow animate-pulse">
              {activeAlerts}
            </span>
          )}
        </button>
      </div>

      {/* ALERTS TABLE */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Alert Type
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Message
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                User
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Status
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading alerts...
                  </div>
                </td>
              </tr>
            ) : (
              alerts.map((alert) => {
                const type = (alert.alert_type || "").toLowerCase().trim();

                return (
                  <tr
                    key={alert.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition ${
                      alert.alert_type === "sos"
                        ? "animate-pulse bg-red-50"
                        : ""
                    }`}
                  >
                    {/* ALERT TYPE */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alertStyles[type] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {alert.alert_type.replace("_", " ")}
                      </span>
                    </td>

                    {/* MESSAGE */}

                    <td className="px-6 py-4 text-gray-600">{alert.message}</td>

                    {/* USER */}

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {alert.user_name || "Unknown"}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.status === "resolved"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        {alert.status !== "resolved" && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-600 px-3 py-2 rounded-lg transition"
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
  );
}

export default Alerts;
