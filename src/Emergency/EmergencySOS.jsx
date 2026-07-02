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
    <div className="min-h-screen bg-white md:bg-slate-50 flex justify-center pb-20 md:py-10">
      <div className="w-full max-w-[430px] bg-white md:shadow-2xl md:rounded-[2.5rem] md:border border-slate-200 flex flex-col min-h-[100dvh] md:min-h-[850px] overflow-hidden relative">
        <div className="px-6 py-6 flex flex-col h-full overflow-y-auto">
          <header className="flex items-center justify-between mb-10">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="text-slate-600 hover:text-slate-900 cursor-pointer p-1"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="font-bold text-[1.35rem] text-[#0f172a] tracking-tight">Emergency Help</h2>
            <div className="bg-slate-100 p-2.5 rounded-full flex items-center justify-center">
              <FiUser className="text-slate-500 h-[22px] w-[22px]" />
            </div>
          </header>

          <div className="text-center mt-2 flex-grow flex flex-col items-center">
            <button
              onClick={activateSOS}
              disabled={sosActivated || loading}
              className={`w-[220px] h-[220px] mx-auto relative rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(229,0,0,0.4)] transition transform hover:scale-105 active:scale-95 border-[12px] ${sosActivated
                  ? "bg-[#e50000] text-white border-[#facc15] cursor-not-allowed"
                  : "bg-[#e50000] text-white border-[#facc15] hover:bg-red-700"
                }`}
            >
              <div className="flex flex-col items-center justify-center mt-[-5px]">
                <span className="text-[4.5rem] font-bold leading-none tracking-tight">{loading ? "..." : "SOS"}</span>
                <span className="text-[13px] font-bold tracking-widest mt-1">PRESS</span>
              </div>
            </button>
            <p className="mt-8 text-[15px] text-slate-600 font-medium">Press the SOS button to activate emergency</p>

            {sosActivated && (
              <div className="mt-6 bg-red-50 p-4 rounded-2xl border border-red-300 text-center w-full animate-pulse">
                <p className="font-semibold text-red-900">🚨 {alertMessage || "Contacting help..."}</p>
                <p className="text-sm text-red-700 mt-1">Location shared successfully</p>
                {driverInfo && (
                  <p className="text-sm text-red-700 mt-2 font-medium">
                    Driver: {driverInfo.name}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col space-y-4 w-full">
            <button
              onClick={callDriver}
              className="w-full bg-[#0f172a] text-white py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] shadow-lg"
            >
              <FiPhoneCall className="h-[22px] w-[22px]" /> Call Driver
            </button>
            <button className="w-full bg-[#0f172a] text-white py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] shadow-lg">
              <FiUsers className="h-[22px] w-[22px]" /> Call Emergency Contact
            </button>
            <button
              onClick={handleShareLiveLocation}
              className="w-full bg-[#0f172a] text-white py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] shadow-lg"
            >
              <FiMapPin className="h-[22px] w-[22px]" /> Share Live Location
            </button>

            {showLiveMap && (
              <div className="mt-4 w-full animate-fade-in">
                <div className="h-48 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner border border-slate-200">
                  <LiveMap rides={[]} center={userLocation} />
                </div>
              </div>
            )}

            <button
              onClick={cancelSOS}
              className="mt-4 w-full border-[2px] border-[#e50000] text-[#e50000] py-[18px] rounded-[2rem] font-semibold transition hover:bg-red-50 inline-flex items-center justify-center gap-2 text-[16px]"
            >
              <FiX className="h-[22px] w-[22px] stroke-[3px]" /> Cancel SOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
