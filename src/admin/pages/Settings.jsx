import axios from "axios";
import { useEffect, useState } from "react";

function Settings() {
  const [activeTab, setActiveTab] = useState("navigation");

  const [notifications, setNotifications] = useState({
    sosSound: localStorage.getItem("sosSound") !== "false",

    rideNotifications: localStorage.getItem("rideNotifications") !== "false",
  });

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
  });

  const [navigationSettings, setNavigationSettings] = useState({
    refreshInterval: localStorage.getItem("refreshInterval") || 5,

    mapZoom: localStorage.getItem("mapZoom") || 12,

    liveTracking: localStorage.getItem("liveTracking") !== "false",

    autoCenter: localStorage.getItem("autoCenter") !== "false",
  });

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")

      .then((res) => {
        setAdmin(res.data);

        setLoading(false);
      })

      .catch((err) => {
        console.log(err);

        setLoading(false);
      });
  }, []);

  const updateProfile = async () => {
    try {
      const res = await axios.put(
        "http://localhost/admin/api/admin.php",
        admin,
      );

      if (res.data.success) {
        setMessage("Profile updated successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updatePassword = async () => {
    try {
      const res = await axios.put(
        "http://localhost/admin/api/admin.php",
        passwordData,
      );

      if (res.data.success) {
        setMessage("Password updated successfully");

        setPasswordData({
          new_password: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveNotifications = () => {
    localStorage.setItem("sosSound", notifications.sosSound);

    localStorage.setItem("rideNotifications", notifications.rideNotifications);

    setMessage("Notification settings updated");
  };

  const saveNavigationSettings = () => {
    localStorage.setItem("refreshInterval", navigationSettings.refreshInterval);

    localStorage.setItem("mapZoom", navigationSettings.mapZoom);

    localStorage.setItem("liveTracking", navigationSettings.liveTracking);

    localStorage.setItem("autoCenter", navigationSettings.autoCenter);

    setMessage("Navigation settings updated");
  };

  return (
    <div>
      {activeTab === "profile" && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin Profile</h2>

          {loading ? (
            <div className="text-gray-500">Loading profile...</div>
          ) : (
            <div>
              {/* SUCCESS MESSAGE */}

              {message && (
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">
                  {message}
                </div>
              )}

              {/* PROFILE FORM */}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>

                  <input
                    type="text"
                    value={admin.name}
                    onChange={(e) =>
                      setAdmin({
                        ...admin,
                        name: e.target.value,
                      })
                    }
                    className=" w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email Address</label>

                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) =>
                      setAdmin({
                        ...admin,
                        email: e.target.value,
                      })
                    }
                    className=" w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={updateProfile}
                className=" mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition"
              >
                Save Profile
              </button>

              {/* PASSWORD SECTION */}

              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Change Password</h3>

                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      new_password: e.target.value,
                    })
                  }
                  className=" w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />

                <button
                  onClick={updatePassword}
                  className=" mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "notifications" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Notification Settings</h2>

              <p className="text-gray-500 mt-1">
                Control alerts and dashboard notifications
              </p>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className=" bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">
              {message}
            </div>
          )}

          <div className="space-y-5">
            {/* SOS SOUND */}

            <div className=" flex justify-between items-center bg-gradient-to-r from-red-50 to-red-100 p-5   ounded-2xl border border-red-100">
              <div>
                <h3 className="font-semibold text-red-700">SOS Alert Sound</h3>

                <p className="text-sm text-red-500 mt-1">
                  Play emergency sound for SOS alerts
                </p>
              </div>

              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    sosSound: !notifications.sosSound,
                  })
                }
                className={` w-14 h-8 flex items-center rounded-full p-1 transition ${notifications.sosSound ? "bg-red-500" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${notifications.sosSound ? "translate-x-6" : ""}`}
                />
              </button>
            </div>

            {/* RIDE ALERT */}

            <div className=" flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-100">
              <div>
                <h3 className="font-semibold text-blue-700">
                  Ride Notifications
                </h3>

                <p className="text-sm text-blue-500 mt-1">
                  Receive ride activity updates
                </p>
              </div>

              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    rideNotifications: !notifications.rideNotifications,
                  })
                }
                className={` w-14 h-8 flex items-center rounded-full p-1 transition ${notifications.rideNotifications ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <div
                  className={` bg-white w-6 h-6 rounded-full shadow-md transform transition ${notifications.rideNotifications ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={saveNotifications}
            className=" mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition"
          >
            Save Notification Settings
          </button>
        </div>
      )}

      {activeTab === "navigation" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Navigation Settings</h2>

              <p className="text-gray-500 mt-1">
                Configure live map tracking and navigation preferences
              </p>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              className="
          bg-green-100
          text-green-700
          px-4
          py-3
          rounded-xl
          mb-5
        "
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* REFRESH INTERVAL */}

            <div
              className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          p-5
          shadow-sm
        "
            >
              <label className="block font-semibold mb-3">
                Map Refresh Interval (seconds)
              </label>

              <input
                type="number"
                min="1"
                value={navigationSettings.refreshInterval}
                onChange={(e) =>
                  setNavigationSettings({
                    ...navigationSettings,
                    refreshInterval: e.target.value,
                  })
                }
                className="
            w-full
            border
            border-gray-200
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-green-500
          "
              />
            </div>

            {/* MAP ZOOM */}

            <div
              className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          p-5
          shadow-sm
        "
            >
              <label className="block font-semibold mb-3">
                Default Map Zoom
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={navigationSettings.mapZoom}
                onChange={(e) =>
                  setNavigationSettings({
                    ...navigationSettings,
                    mapZoom: e.target.value,
                  })
                }
                className="
            w-full
            border
            border-gray-200
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-green-500
          "
              />
            </div>

            {/* LIVE TRACKING */}

            <div
              className="
          flex
          justify-between
          items-center
          bg-gradient-to-r
          from-green-50
          to-green-100
          p-5
          rounded-2xl
          border
          border-green-100
        "
            >
              <div>
                <h3 className="font-semibold text-green-700">Live Tracking</h3>

                <p className="text-sm text-green-600 mt-1">
                  Enable real-time driver tracking
                </p>
              </div>

              <button
                onClick={() =>
                  setNavigationSettings({
                    ...navigationSettings,
                    liveTracking: !navigationSettings.liveTracking,
                  })
                }
                className={`
            w-14
            h-8
            flex
            items-center
            rounded-full
            p-1
            transition

            ${navigationSettings.liveTracking ? "bg-green-500" : "bg-gray-300"}
          `}
              >
                <div
                  className={`
              bg-white
              w-6
              h-6
              rounded-full
              shadow-md
              transform
              transition

              ${navigationSettings.liveTracking ? "translate-x-6" : ""}
            `}
                />
              </button>
            </div>

            {/* AUTO CENTER */}

            <div
              className="
          flex
          justify-between
          items-center
          bg-gradient-to-r
          from-blue-50
          to-blue-100
          p-5
          rounded-2xl
          border
          border-blue-100
        "
            >
              <div>
                <h3 className="font-semibold text-blue-700">Auto Center Map</h3>

                <p className="text-sm text-blue-600 mt-1">
                  Automatically center map on active rides
                </p>
              </div>

              <button
                onClick={() =>
                  setNavigationSettings({
                    ...navigationSettings,
                    autoCenter: !navigationSettings.autoCenter,
                  })
                }
                className={`
            w-14
            h-8
            flex
            items-center
            rounded-full
            p-1
            transition

            ${navigationSettings.autoCenter ? "bg-blue-500" : "bg-gray-300"}
          `}
              >
                <div
                  className={`
              bg-white
              w-6
              h-6
              rounded-full
              shadow-md
              transform
              transition

              ${navigationSettings.autoCenter ? "translate-x-6" : ""}
            `}
                />
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={saveNavigationSettings}
            className="
        mt-8
        bg-green-600
        hover:bg-green-700
        text-white
        px-6
        py-3
        rounded-2xl
        font-semibold
        transition
      "
          >
            Save Navigation Settings
          </button>
        </div>
      )}
    </div>
  );
}

export default Settings;
