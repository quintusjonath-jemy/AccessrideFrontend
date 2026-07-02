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
    <div className="min-h-screen bg-slate-50 flex justify-center pb-24 md:py-10">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-5xl bg-white md:shadow-2xl md:rounded-[2rem] md:border border-slate-200 flex flex-col min-h-screen md:min-h-fit overflow-hidden relative transition-all duration-300">
        <div className="px-6 py-6 md:p-8 lg:p-12 flex flex-col h-full flex-grow">
          <header className="flex items-center justify-between mb-8 lg:mb-12">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="text-slate-600 hover:text-slate-900 cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FiArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
            </button>
            <h2 className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight">Emergency Help</h2>
            <div className="bg-slate-100 p-2.5 md:p-3 rounded-full flex items-center justify-center">
              <FiUser className="text-slate-500 h-5 w-5 md:h-6 md:w-6" />
            </div>
          </header>

          <div className="flex-grow flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Side: SOS Button & Status */}
            <div className="flex flex-col items-center justify-center w-full lg:border-r lg:border-slate-100 lg:pr-12">
              <div className="text-center w-full">
                <button
                  onClick={activateSOS}
                  disabled={sosActivated || loading}
                  className={`w-48 h-48 md:w-64 md:h-64 mx-auto relative rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-105 active:scale-95 border-[10px] md:border-[14px] ${sosActivated
                      ? "bg-[#e50000] text-white border-[#facc15] cursor-not-allowed"
                      : "bg-[#e50000] text-white border-[#facc15] hover:bg-red-700"
                    }`}
                >
                  <div className="flex flex-col items-center justify-center mt-[-5px]">
                    <span className="text-5xl md:text-7xl font-bold leading-none tracking-tight">{loading ? "..." : "SOS"}</span>
                    <span className="text-sm md:text-base font-bold tracking-widest mt-1">PRESS</span>
                  </div>
                </button>
                <p className="mt-8 md:mt-10 text-base md:text-lg text-slate-600 font-medium">Press the SOS button to activate emergency</p>
              </div>

              {sosActivated && (
                <div className="mt-6 md:mt-10 bg-red-50 p-4 md:p-6 rounded-2xl border border-red-300 text-center w-full max-w-sm mx-auto animate-pulse">
                  <p className="font-semibold text-red-900 md:text-lg">🚨 {alertMessage || "Contacting help..."}</p>
                  <p className="text-sm md:text-base text-red-700 mt-1">Location shared successfully</p>
                  {driverInfo && (
                    <p className="text-sm md:text-base text-red-700 mt-2 font-medium">
                      Driver: {driverInfo.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Map and Action Buttons */}
            <div className="mt-10 lg:mt-0 flex flex-col justify-center w-full">
              <div className="flex flex-col space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:flex lg:flex-col lg:space-y-4">
                <button
                  onClick={callDriver}
                  className="w-full bg-[#0f172a] text-white py-4 rounded-full font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-base md:text-lg shadow-lg"
                >
                  <FiPhoneCall className="h-5 w-5 md:h-6 md:w-6" /> Call Driver
                </button>
                <button className="w-full bg-[#0f172a] text-white py-4 rounded-full font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-base md:text-lg shadow-lg">
                  <FiUsers className="h-5 w-5 md:h-6 md:w-6" /> Call Emergency Contact
                </button>
                <button
                  onClick={handleShareLiveLocation}
                  className="w-full bg-[#0f172a] text-white py-4 rounded-full font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-base md:text-lg shadow-lg md:col-span-2 lg:col-span-1"
                >
                  <FiMapPin className="h-5 w-5 md:h-6 md:w-6" /> Share Live Location
                </button>
              </div>

              {showLiveMap && (
                <div className="mt-6 md:mt-8 w-full animate-fade-in">
                  <h3 className="mb-3 text-sm md:text-base font-semibold text-slate-700">Live Location Map</h3>
                  <div className="h-48 md:h-64 lg:h-56 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner">
                    <LiveMap rides={[]} center={userLocation} />
                  </div>
                </div>
              )}

              <button
                onClick={cancelSOS}
                className="mt-6 md:mt-8 w-full border-[2px] border-[#e50000] text-[#e50000] py-4 rounded-full font-semibold transition hover:bg-red-50 inline-flex items-center justify-center gap-2 text-base md:text-lg"
              >
                <FiX className="h-5 w-5 md:h-6 md:w-6 stroke-[3px]" /> Cancel SOS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
