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
      .get(
        "http://localhost/admin/api/admin.php?action=notifications"
      )
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
      formData.append(
        "email_notifications",
        settings.email_notifications
      );

      const res = await axios.post(
        "http://localhost/admin/api/admin.php?action=notifications",
        formData
      );

      if (res.data.success) {
        setMessage(
          "Notification settings updated successfully"
        );

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const SettingCard = ({
    icon,
    title,
    description,
    name,
    checked,
  }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">
              {title}
            </h3>

            <p className="text-sm text-gray-500">
              {description}
            </p>
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

          <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>

          <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transition-all peer-checked:translate-x-7"></div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <Bell size={42} />

          <div>
            <h1 className="text-2xl font-bold">
              Notification Settings
            </h1>

            <p className="text-blue-100">
              Manage alerts and communication preferences
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-5 rounded-2xl">
          <h4 className="text-sm text-gray-500">
            SOS Alerts
          </h4>

          <p className="text-2xl font-bold text-red-600">
            {settings.sos_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-green-50 p-5 rounded-2xl">
          <h4 className="text-sm text-gray-500">
            Ride Alerts
          </h4>

          <p className="text-2xl font-bold text-green-600">
            {settings.ride_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-yellow-50 p-5 rounded-2xl">
          <h4 className="text-sm text-gray-500">
            Driver Alerts
          </h4>

          <p className="text-2xl font-bold text-yellow-600">
            {settings.driver_alert ? "ON" : "OFF"}
          </p>
        </div>

        <div className="bg-purple-50 p-5 rounded-2xl">
          <h4 className="text-sm text-gray-500">
            Email Alerts
          </h4>

          <p className="text-2xl font-bold text-purple-600">
            {settings.email_notifications ? "ON" : "OFF"}
          </p>
        </div>
      </div>

      {/* Notification Cards */}

      <div className="space-y-4">

        <SettingCard
          icon={<Siren className="text-red-600" size={22} />}
          title="SOS Alerts"
          description="Receive emergency SOS notifications instantly."
          name="sos_alert"
          checked={settings.sos_alert == 1}
        />

        <SettingCard
          icon={<Car className="text-green-600" size={22} />}
          title="Ride Alerts"
          description="Get notifications for ride updates and activity."
          name="ride_alert"
          checked={settings.ride_alert == 1}
        />

        <SettingCard
          icon={<UserCog className="text-yellow-600" size={22} />}
          title="Driver Alerts"
          description="Receive driver registration and status alerts."
          name="driver_alert"
          checked={settings.driver_alert == 1}
        />

        <SettingCard
          icon={<Mail className="text-purple-600" size={22} />}
          title="Email Notifications"
          description="Receive important updates through email."
          name="email_notifications"
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