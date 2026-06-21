import { useState } from "react";
import { FiPhoneCall, FiMapPin, FiUsers, FiX, FiArrowLeft, FiUser } from "react-icons/fi";
import LiveMap from "../admin/components/LiveMap";
import { useNavigate } from "react-router-dom";

const EmergencySOS = () => {
  const navigate = useNavigate();
  const [sosActivated, setSOSActivated] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [userLocation, setUserLocation] = useState([79.8612, 6.9271]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Get user ID from localStorage or session
  const getUserId = () => {
    return localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || 1;
  };

  const activateSOS = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        // Send SOS alert to backend
        fetch("http://localhost/AccessrideBackend/Emergency/sos.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: getUserId(),
            latitude: latitude,
            longitude: longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setLoading(false);
            if (data.status === "success") {
              setSOSActivated(true);
              if (data.driver_info) {
                setDriverInfo(data.driver_info);
                setAlertMessage(`📞 Driver ${data.driver_info.name} is being contacted. Help is on the way!`);
              } else {
                setAlertMessage("🚨 SOS Alert sent. Emergency services notified!");
              }
            } else {
              alert("Failed to send SOS: " + data.message);
            }
          })
          .catch((error) => {
            setLoading(false);
            console.error("Error sending SOS:", error);
            alert("Error sending SOS alert");
          });
      },
      () => {
        setLoading(false);
        alert("Unable to retrieve your location. Showing default map center.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const callDriver = () => {
    if (driverInfo && driverInfo.phone) {
      window.location.href = `tel:${driverInfo.phone}`;
    } else {
      alert("Driver information not available");
    }
  };

  const cancelSOS = () => {
    setSOSActivated(false);
    setDriverInfo(null);
    setAlertMessage("");
    alert("SOS cancelled");
  };

  const handleShareLiveLocation = () => {
    setShowLiveMap(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      () => {
        alert("Unable to retrieve your location. Showing default map center.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-sm bg-white shadow-lg p-6 ring-1 ring-slate-200 min-h-screen flex flex-col">
        <header className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate("/user/dashboard")}
            className="text-slate-600 hover:text-slate-900 text-xl cursor-pointer"
          >
            <FiArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="font-bold text-lg text-slate-900">Emergency Help</h2>
          <div className="text-xl">👤</div>
        </header>

        <div className="text-center mt-8">
          <button
            onClick={activateSOS}
            disabled={sosActivated || loading}
            className={`w-40 h-40 mx-auto relative rounded-full flex items-center justify-center text-5xl font-bold border-8 shadow-2xl transition transform hover:scale-105 active:scale-95 ${
              sosActivated
                ? "bg-red-700 text-white border-yellow-400 cursor-not-allowed"
                : "bg-red-600 text-white border-yellow-400 hover:bg-red-700"
            }`}
          >
            {loading ? "..." : "SOS"}
            <div className="absolute text-xs font-semibold mt-14">PRESS</div>
          </button>
          <p className="mt-6 text-sm text-slate-600 font-medium">Press the SOS button to activate emergency</p>
        </div>

        {sosActivated && (
          <div className="mt-6 bg-red-50 p-4 rounded-3xl border-2 border-red-300 text-center ring-1 ring-red-200">
            <p className="font-semibold text-red-900">🚨 {alertMessage || "Contacting help..."}</p>
            <p className="text-sm text-red-700 mt-1">Location shared successfully</p>
            {driverInfo && (
              <p className="text-sm text-red-700 mt-2 font-medium">
                Driver: {driverInfo.name}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={callDriver}
            className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2"
          >
            <FiPhoneCall className="h-5 w-5" /> Call Driver
          </button>
          <button className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <FiUsers className="h-5 w-5" /> Call Emergency Contact
          </button>
          <button
            onClick={handleShareLiveLocation}
            className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2"
          >
            <FiMapPin className="h-5 w-5" /> Share Live Location
          </button>
        </div>

        {showLiveMap && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Live Location Map</h3>
            <LiveMap rides={[]} center={userLocation} />
          </div>
        )}

        <button
          onClick={cancelSOS}
          className="mt-6 w-full border-2 border-red-500 text-red-600 py-3 rounded-3xl font-medium transition hover:bg-red-50 inline-flex items-center justify-center gap-2"
        >
          <FiX className="h-5 w-5" /> Cancel SOS
        </button>
      </div>
    </div>
  );
};

export default EmergencySOS;
