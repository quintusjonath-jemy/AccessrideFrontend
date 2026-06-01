import axios from "axios";
import { useEffect, useState } from "react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    id: 1,
    sos_alert: 1,
    ride_alert: 1,
    driver_alert: 1,
    email_notifications: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php?action=notifications")
      .then((res) => {
        setSettings({
          id: 1,
          ...res.data,
        });
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
        "http://localhost/admin/api/admin.php?action=notifications",
        formData,
      );

      console.log(res.data);

      alert("Notification settings saved");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <div className="space-y-5">
        <label className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">SOS Alerts</h3>

            <p className="text-sm text-gray-500">
              Receive emergency SOS notifications
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="sos_alert"
              checked={settings.sos_alert == 1}
              onChange={handleToggle}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>

            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </label>

        <label className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Ride Alerts</h3>

            <p className="text-sm text-gray-500">Receive ride notifications</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="ride_alert"
              checked={settings.ride_alert == 1}
              onChange={handleToggle}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>

            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </label>

        <label className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Driver Alerts</h3>

            <p className="text-sm text-gray-500">
              Receive driver notifications
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="driver_alert"
              checked={settings.driver_alert == 1}
              onChange={handleToggle}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>

            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </label>

        <label className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Email Notifications</h3>

            <p className="text-sm text-gray-500">
              Receive email notifications
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email_notifications"
              checked={settings.email_notifications == 1}
              onChange={handleToggle}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>

            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </label>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
