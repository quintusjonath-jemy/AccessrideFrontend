import axios from "axios";
import { useEffect, useState } from "react";

function SystemSettings() {
  const [settings, setSettings] = useState({
    id: 1,
    theme: "light",
    refresh_rate: 5,
    sos_enabled: 1,
    tracking_enabled: 1,
  });

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php?action=system")
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
    const formData = new FormData();

    formData.append("id", settings.id);
    formData.append("theme", settings.theme);
    formData.append("refresh_rate", settings.refresh_rate);
    formData.append("sos_enabled", settings.sos_enabled);
    formData.append("tracking_enabled", settings.tracking_enabled);

    await axios.post(
      "http://localhost/admin/api/admin.php?action=system",
      formData,
    );

    alert("System settings updated");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-6">
        <div>
          <label className="font-semibold block mb-3">Dashboard Theme</label>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() =>
                setSettings({
                  ...settings,
                  theme: "light",
                })
              }
              className={`cursor-pointer border-2 rounded-xl p-4 transition ${
                settings.theme === "light"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-full h-20 bg-white rounded-lg border mb-3"></div>

              <h3 className="font-semibold">Light Theme</h3>

              <p className="text-sm text-gray-500">Bright dashboard layout</p>
            </div>

            <div
              onClick={() =>
                setSettings({
                  ...settings,
                  theme: "dark",
                })
              }
              className={`cursor-pointer border-2 rounded-xl p-4 transition ${
                settings.theme === "dark"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-full h-20 bg-gray-900 rounded-lg mb-3"></div>

              <h3 className="font-semibold">Dark Theme</h3>

              <p className="text-sm text-gray-500">Comfortable night mode</p>
            </div>
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-3">Live Refresh Rate</label>

          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 30].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    refresh_rate: rate,
                  })
                }
                className={`p-4 rounded-xl border-2 transition ${
                  settings.refresh_rate == rate
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-2xl font-bold">{rate}</p>

                <p className="text-sm">Seconds</p>
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Dashboard data updates every {settings.refresh_rate} seconds.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold">Enable SOS System</h3>
              <p className="text-sm text-gray-500">
                Receive emergency alerts from users
              </p>
            </div>

            {/* Toggle */}

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="sos_enabled"
                checked={settings.sos_enabled == 1}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer  peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold">Enable Driver Tracking</h3>
              <p className="text-sm text-gray-500">
                Track driver locations in real time
              </p>
            </div>

            {/* Toggle */}

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="tracking_enabled"
                checked={settings.tracking_enabled == 1}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer  peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition"
        >
          Save System Settings
        </button>
      </div>
    </div>
  );
}

export default SystemSettings;
