import axios from "axios";
import { useEffect, useState } from "react";

import {
  Bell,
  Siren,
  Car,
  UserCog,
  Mail,
  Save,
  CheckCircle,
} from "lucide-react";
import API_BASE from "../../../config/api";

const SettingCard = ({
  icon,
  title,
  description,
  name,
  checked,
  handleToggle,
}) => (
  <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <div className="bg-blue-50 dark:bg-slate-900/60 p-3 rounded-xl">{icon}</div>

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-slate-100">{title}</h3>

          <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleToggle}
          className="sr-only peer"
        />

        <div className="w-14 h-7 bg-gray-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>

        <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transition-all peer-checked:translate-x-7"></div>
      </label>
    </div>
  </div>
);

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    id: 1,
    sos_alert: 1,
    ride_alert: 1,
    driver_alert: 1,
    email_notifications: 0,
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/admin/api/settings.php?action=notifications`)
      .then((res) => {
        setSettings({
          id: 1,
          ...res.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleToggle = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked ? 1 : 0,
    });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("id", settings.id);
      formData.append("sos_alert", settings.sos_alert);
      formData.append("ride_alert", settings.ride_alert);
      formData.append("driver_alert", settings.driver_alert);
      formData.append("email_notifications", settings.email_notifications);

      const res = await axios.post(
        `${API_BASE}/admin/api/settings.php?action=notifications`,
        formData,
      );

      if (res.data.success) {
        setMessage("Notification settings updated successfully");

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <Bell size={42} />

          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>

            <p className="text-blue-100">
              Manage alerts and communication preferences
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}

      {message && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-2 transition-colors">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-950/25 p-5 rounded-2xl border dark:border-red-900/30 transition-colors">
          <h4 className="text-sm text-gray-500 dark:text-slate-400">SOS Alerts</h4>

          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {settings.sos_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/25 p-5 rounded-2xl border dark:border-green-900/30 transition-colors">
          <h4 className="text-sm text-gray-500 dark:text-slate-400">Ride Alerts</h4>

          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {settings.ride_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/25 p-5 rounded-2xl border dark:border-yellow-900/30 transition-colors">
          <h4 className="text-sm text-gray-500 dark:text-slate-400">Driver Alerts</h4>

          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {settings.driver_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/25 p-5 rounded-2xl border dark:border-purple-900/30 transition-colors">
          <h4 className="text-sm text-gray-500 dark:text-slate-400">Email Alerts</h4>

          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {settings.email_notifications ? "ON" : "OFF"}
          </p>
        </div>
      </div>

      {/* Notification Cards */}

      <div className="space-y-4">
        <SettingCard
          icon={<Siren className="text-red-600 dark:text-red-400" size={22} />}
          title="SOS Alerts"
          description="Receive emergency SOS notifications instantly."
          name="sos_alert"
          handleToggle={handleToggle}
          checked={settings.sos_alert == 1}
        />

        <SettingCard
          icon={<Car className="text-green-600 dark:text-green-400" size={22} />}
          title="Ride Alerts"
          description="Get notifications for ride updates and activity."
          name="ride_alert"
          handleToggle={handleToggle}
          checked={settings.ride_alert == 1}
        />

        <SettingCard
          icon={<UserCog className="text-yellow-600 dark:text-yellow-400" size={22} />}
          title="Driver Alerts"
          description="Receive driver registration and status alerts."
          name="driver_alert"
          handleToggle={handleToggle}
          checked={settings.driver_alert == 1}
        />

        <SettingCard
          icon={<Mail className="text-purple-600 dark:text-purple-400" size={22} />}
          title="Email Notifications"
          description="Receive important updates through email."
          name="email_notifications"
          handleToggle={handleToggle}
          checked={settings.email_notifications == 1}
        />
      </div>

      {/* Save Button */}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
