import axios from "axios";
import { useEffect, useState } from "react";
import {
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Shield,
  MapPinned,
  Save,
} from "lucide-react";

function SystemSettings() {
  const [settings, setSettings] = useState({
    id: 1,
    theme: "light",
    refresh_rate: 5,
    sos_enabled: 1,
    tracking_enabled: 1,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/settings.php?action=system")
      .then((res) => {
        setSettings({
          id: 1,
          ...res.data,
        });
      });
  }, []);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
            ? 1
            : 0
          : e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("id", settings.id);
      formData.append("theme", settings.theme);
      formData.append("refresh_rate", settings.refresh_rate);
      formData.append("sos_enabled", settings.sos_enabled);
      formData.append("tracking_enabled", settings.tracking_enabled);

      await axios.post(
        "http://localhost/admin/api/settings.php?action=system",
        formData
      );

      if (settings.theme === "dark") {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }

      alert("System settings updated successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to save settings");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Monitor size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>

            <p className="text-blue-100 mt-1">
              Configure dashboard behavior and platform controls
            </p>
          </div>
        </div>
      </div>

      {/* THEME SETTINGS */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h2 className="font-bold text-xl mb-5 flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <Monitor size={20} />
          Appearance
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* LIGHT */}

          <div
            onClick={() =>
              setSettings({
                ...settings,
                theme: "light",
              })
            }
            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
              settings.theme === "light"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "border-gray-200 dark:border-slate-750 text-gray-800 dark:text-slate-200"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <Sun className="text-yellow-500" />
              {settings.theme === "light" && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">Selected</span>
              )}
            </div>

            <div className="h-24 bg-white dark:bg-slate-900 border dark:border-slate-750 rounded-xl mb-3"></div>

            <h3 className="font-semibold text-gray-800 dark:text-slate-100">Light Theme</h3>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Clean and bright interface
            </p>
          </div>

          {/* DARK */}

          <div
            onClick={() =>
              setSettings({
                ...settings,
                theme: "dark",
              })
            }
            className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
              settings.theme === "dark"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                : "border-gray-200 dark:border-slate-750 text-gray-800 dark:text-slate-200"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <Moon className="text-indigo-600 dark:text-indigo-400" />
              {settings.theme === "dark" && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Selected</span>
              )}
            </div>

            <div className="h-24 bg-gray-900 dark:bg-slate-950 border dark:border-slate-750 rounded-xl mb-3"></div>

            <h3 className="font-semibold text-gray-800 dark:text-slate-100">Dark Theme</h3>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Comfortable for low-light usage
            </p>
          </div>
        </div>
      </div>

      {/* REFRESH RATE */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h2 className="font-bold text-xl mb-5 flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <RefreshCw size={20} />
          Dashboard Refresh Rate
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {[5, 10, 30].map((rate) => (
            <button
              key={rate}
              onClick={() =>
                setSettings({
                  ...settings,
                  refresh_rate: rate,
                })
              }
              className={`p-5 rounded-2xl border-2 transition ${
                settings.refresh_rate == rate
                  ? "border-green-500 bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400"
                  : "border-gray-200 dark:border-slate-750 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-slate-300"
              }`}
            >
              <h3 className="text-3xl font-bold">{rate}</h3>

              <p className="text-sm">Seconds</p>
            </button>
          ))}
        </div>

        <div className="mt-4 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-green-700 dark:text-green-400">
          Dashboard updates automatically every{" "}
          <strong>{settings.refresh_rate}</strong> seconds.
        </div>
      </div>

      {/* SECURITY SETTINGS */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h2 className="font-bold text-xl mb-5 flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <Shield size={20} />
          Safety & Tracking
        </h2>

        <div className="space-y-4">
          {/* SOS */}

          <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-750 transition-colors">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">Emergency SOS System</h3>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                Allow blind users to trigger emergency alerts.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                name="sos_enabled"
                checked={settings.sos_enabled == 1}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-14 h-7 bg-gray-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-red-500 after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>

          {/* TRACKING */}

          <div className="flex justify-between items-center p-5 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-750 transition-colors">
            <div>
              <h3 className="font-semibold flex items-center gap-2 text-gray-800 dark:text-slate-100">
                <MapPinned size={18} />
                Driver Tracking
              </h3>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                Enable real-time driver monitoring.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                name="tracking_enabled"
                checked={settings.tracking_enabled == 1}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-14 h-7 bg-gray-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>
        </div>
      </div>

      {/* SAVE */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold flex justify-center items-center gap-3 hover:shadow-lg transition"
        >
          <Save size={20} />

          {saving ? "Saving..." : "Save System Settings"}
        </button>
      </div>
    </div>
  );
}

export default SystemSettings;