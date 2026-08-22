import { useState, useEffect, useRef } from "react";
import { FiPhoneCall, FiMapPin, FiUsers, FiX, FiArrowLeft, FiUser } from "react-icons/fi";
import LiveMap from "../admin/components/LiveMap";
import { useNavigate, useLocation } from "react-router-dom";
import { Peer } from "peerjs";
import API_BASE from "../config/api";

const EmergencySOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sosActivated, setSOSActivated] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const sosTriggeredRef = useRef(false);
  const [userLocation, setUserLocation] = useState([79.8612, 6.9271]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [userName, setUserName] = useState("Passenger");
  const [webRtcStatus, setWebRtcStatus] = useState("idle"); // idle, calling, connected, error, ended
  const [peerError, setPeerError] = useState(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Get user ID from localStorage or session
  const getUserId = () => {
    return localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || 1;
  };

  useEffect(() => {
    // Fetch passenger's name to pass to the admin receiver
    const userId = getUserId();
    fetch(`${API_BASE}/history_and_profile/profile/get_profile.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const name = `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim();
          if (name) setUserName(name);
        }
      })
      .catch((err) => console.error("Error fetching user profile:", err));
  }, []);

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
        fetch(`${API_BASE}/Emergency/sos.php`, {
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

  const startWebRtcCall = async () => {
    setWebRtcStatus("calling");
    setPeerError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("Rider WebRTC connected. Peer ID:", id);
        const call = peer.call("accessride-admin-emergency", stream, {
          metadata: { name: userName }
        });
        activeCallRef.current = call;

        call.on("stream", (remoteStream) => {
          setWebRtcStatus("connected");
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(e => console.error("Remote audio play failed:", e));
          }
        });

        call.on("close", () => {
          setWebRtcStatus("ended");
          cleanupWebRtc();
        });

        call.on("error", (err) => {
          console.error("WebRTC call error:", err);
          setWebRtcStatus("error");
          setPeerError(err.message);
          cleanupWebRtc();
        });
      });

      peer.on("error", (err) => {
        console.error("Rider PeerJS error:", err);
        setWebRtcStatus("error");
        if (err.type === "peer-unavailable") {
          setPeerError("Emergency Dispatcher is currently offline.");
        } else {
          setPeerError(err.message);
        }
        cleanupWebRtc();
      });

    } catch (err) {
      console.error("Failed to access microphone:", err);
      setWebRtcStatus("error");
      setPeerError("Microphone permission is required to place the call.");
      cleanupWebRtc();
    }
  };

  const cleanupWebRtc = () => {
    if (activeCallRef.current) {
      activeCallRef.current.close();
      activeCallRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setWebRtcStatus("idle");
  };

  const handleSOSClick = () => {
    if (!sosActivated) {
      activateSOS();
      startWebRtcCall();
    }
  };

  useEffect(() => {
    if (location.state?.autoTrigger && !sosTriggeredRef.current) {
      sosTriggeredRef.current = true;
      activateSOS();
      startWebRtcCall();
    }
  }, [location.state]);

  const callDriver = () => {
    if (driverInfo && driverInfo.phone) {
      window.location.href = `tel:${driverInfo.phone}`;
    } else {
      alert("Driver information not available");
    }
  };

  const cancelSOS = () => {
    cleanupWebRtc();
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
      <audio ref={remoteAudioRef} className="hidden" />
      <div className="w-full max-w-[430px] md:max-w-2xl lg:max-w-[430px] bg-white md:shadow-2xl md:rounded-[2.5rem] md:border border-slate-200 flex flex-col min-h-[100dvh] md:min-h-fit overflow-hidden relative transition-all duration-300">
        <div className="px-6 py-6 md:p-8 lg:px-6 lg:py-6 flex flex-col h-full flex-grow">
          <header className="flex items-center justify-between mb-8 md:mb-12 lg:mb-10">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="text-slate-600 hover:text-slate-900 cursor-pointer p-1 md:p-2 lg:p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FiArrowLeft className="h-6 w-6 md:h-7 md:w-7 lg:h-6 lg:w-6" />
            </button>
            <h2 className="font-bold text-[1.35rem] md:text-2xl lg:text-[1.35rem] text-[#0f172a] tracking-tight">Emergency Help</h2>
            <div className="bg-slate-100 p-2.5 md:p-3 lg:p-2.5 rounded-full flex items-center justify-center">
              <FiUser className="text-slate-500 h-[22px] w-[22px] md:h-6 md:w-6 lg:h-[22px] lg:w-[22px]" />
            </div>
          </header>

          <div className="flex-grow flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col md:gap-12 lg:gap-0 md:items-center lg:items-stretch">
            {/* Left Side: SOS Button & Status */}
            <div className="flex flex-col items-center justify-center w-full md:border-r md:border-slate-100 lg:border-r-0 md:pr-12 lg:pr-0">
              <div className="text-center w-full mt-2 md:mt-0 lg:mt-2 flex flex-col items-center">
                <button
                  onClick={handleSOSClick}
                  className={`w-[220px] h-[220px] md:w-64 md:h-64 lg:w-[220px] lg:h-[220px] mx-auto relative rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(229,0,0,0.4)] transition transform hover:scale-105 active:scale-95 border-[12px] md:border-[14px] lg:border-[12px] ${sosActivated
                      ? "bg-[#e50000] text-white border-[#facc15] cursor-not-allowed"
                      : "bg-[#e50000] text-white border-[#facc15] hover:bg-red-700"
                    }`}
                >
                  <div className="flex flex-col items-center justify-center mt-[-5px]">
                    <span className="text-[4.5rem] md:text-7xl lg:text-[4.5rem] font-bold leading-none tracking-tight">{loading ? "..." : "SOS"}</span>
                    <span className="text-[13px] md:text-base lg:text-[13px] font-bold tracking-widest mt-1">PRESS</span>
                  </div>
                </button>
                <p className="mt-8 md:mt-10 lg:mt-8 text-[15px] md:text-lg lg:text-[15px] text-slate-600 font-medium">Press the SOS button to activate emergency</p>
              </div>

              {sosActivated && (
                <div className="mt-6 md:mt-10 lg:mt-6 bg-red-50 p-4 md:p-6 lg:p-4 rounded-2xl border border-red-300 text-center w-full max-w-sm mx-auto animate-pulse">
                  <p className="font-semibold text-red-900 md:text-lg lg:text-base">🚨 {alertMessage || "Contacting help..."}</p>
                  <p className="text-sm md:text-base lg:text-sm text-red-700 mt-1">Location shared successfully</p>
                  {driverInfo && (
                    <p className="text-sm md:text-base lg:text-sm text-red-700 mt-2 font-medium">
                      Driver: {driverInfo.name}
                    </p>
                  )}
                </div>
              )}

              {webRtcStatus !== "idle" && (
                <div className="mt-4 bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/20 text-center w-full max-w-sm mx-auto shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${webRtcStatus === "connected" ? "bg-emerald-500/20 animate-pulse text-emerald-400" : "bg-slate-800 text-slate-400 animate-spin"}`}>
                        <FiPhoneCall className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Emergency Operator Call</p>
                        <p className="text-[12px] text-slate-400">
                          {webRtcStatus === "calling" && "Calling dispatcher..."}
                          {webRtcStatus === "connected" && "Connected - Speak Now"}
                          {webRtcStatus === "ended" && "Call Ended"}
                          {webRtcStatus === "error" && (peerError || "Connection error")}
                        </p>
                      </div>
                    </div>
                    {webRtcStatus !== "ended" && webRtcStatus !== "error" && (
                      <button
                        onClick={cleanupWebRtc}
                        className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition"
                      >
                        <FiX className="text-white h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Map and Action Buttons */}
            <div className="mt-12 md:mt-0 lg:mt-12 flex flex-col justify-center w-full">
              <div className="flex flex-col space-y-4 w-full">
                <button
                  onClick={callDriver}
                  className="w-full bg-[#0f172a] text-white py-[18px] md:py-4 lg:py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] md:text-lg lg:text-[16px] shadow-lg"
                >
                  <FiPhoneCall className="h-[22px] w-[22px] md:h-6 md:w-6 lg:h-[22px] lg:w-[22px]" /> Call Driver
                </button>
                <button className="w-full bg-[#0f172a] text-white py-[18px] md:py-4 lg:py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] md:text-lg lg:text-[16px] shadow-lg">
                  <FiUsers className="h-[22px] w-[22px] md:h-6 md:w-6 lg:h-[22px] lg:w-[22px]" /> Call Emergency Contact
                </button>
                <button
                  onClick={handleShareLiveLocation}
                  className="w-full bg-[#0f172a] text-white py-[18px] md:py-4 lg:py-[18px] rounded-[2rem] font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-3 text-[16px] md:text-lg lg:text-[16px] shadow-lg"
                >
                  <FiMapPin className="h-[22px] w-[22px] md:h-6 md:w-6 lg:h-[22px] lg:w-[22px]" /> Share Live Location
                </button>

                {showLiveMap && (
                  <div className="mt-4 md:mt-8 lg:mt-4 w-full animate-fade-in">
                    <div className="h-48 md:h-64 lg:h-48 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-inner border border-slate-200">
                      <LiveMap rides={[]} center={userLocation} trackedLocation={userLocation} />
                    </div>
                  </div>
                )}

                <button
                  onClick={cancelSOS}
                  className="mt-4 md:mt-8 lg:mt-4 w-full border-[2px] border-[#e50000] text-[#e50000] py-[18px] md:py-4 lg:py-[18px] rounded-[2rem] font-semibold transition hover:bg-red-50 inline-flex items-center justify-center gap-2 text-[16px] md:text-lg lg:text-[16px]"
                >
                  <FiX className="h-[22px] w-[22px] md:h-6 md:w-6 lg:h-[22px] lg:w-[22px] stroke-[3px]" /> Cancel SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;