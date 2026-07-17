import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiMapPin, FiClock, FiDollarSign, FiUser, FiTruck, FiCreditCard, FiCheckCircle, FiLock, FiLoader } from "react-icons/fi";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : true;
  });
  const [activeRide, setActiveRide] = useState(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [recentRides, setRecentRides] = useState([]);
  const [rideRequest, setRideRequest] = useState({
    id: null,
    passengerName: "",
    pickup: "",
    dropoff: "",
    distance: "",
    duration: "",
    fare: ""
  });
  const [driverInfo, setDriverInfo] = useState({
    first_name: "Driver",
    rating: 4.8,
    total_trips: 0
  });
  const [statistics, setStatistics] = useState({
    rating: 4.8,
    total_trips: 0,
    today_earnings: 0.00,
    today_trips: 0,
    subscription_status: "",
    subscription_expires_at: ""
  });

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form"); // form, processing, success, error
  const [checkoutError, setCheckoutError] = useState("");
  const [txnId, setTxnId] = useState("");

  const submitPayment = async (e) => {
    if (e) e.preventDefault();
    setCheckoutStep("processing");
    setCheckoutError("");

    let driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    
    try {
      // 1. Fetch secure PayHere configuration and MD5 hash from backend
      const response = await fetch("http://localhost/Driverdashboard/api/initiate_payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driverId
        })
      });

      const res = await response.json();
      if (!res.success || !res.payhere_config) {
        setCheckoutError(res.message || "Failed to initialize payment gateway.");
        setCheckoutStep("error");
        return;
      }

      const config = res.payhere_config;

      // 2. Configure PayHere callbacks
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("PayHere Payment completed. OrderID:" + orderId);
        setTxnId(orderId);
        
        // Live update the UI state instantly to active (avoids background webhook race condition delays)
        setStatistics(prev => ({
          ...prev,
          subscription_status: 'active'
        }));
        
        // Localhost development fallback: trigger local subscription renewal since webhook cannot reach localhost
        fetch("http://localhost/Driverdashboard/api/renew_subscription.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driver_id: driverId,
            amount: 3000.00
          })
        })
        .then(() => {
          setCheckoutStep("success");
          setTimeout(() => {
            setShowCheckoutModal(false);
            setCheckoutStep("form");
            fetchDashboardData();
          }, 3000);
        })
        .catch(err => {
          console.error("Local database update failed:", err);
          setCheckoutStep("success");
          setTimeout(() => {
            setShowCheckoutModal(false);
            setCheckoutStep("form");
            fetchDashboardData();
          }, 3000);
        });
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("PayHere Payment dismissed");
        setCheckoutStep("form");
      };

      window.payhere.onError = function onError(error) {
        console.error("PayHere Error:", error);
        setCheckoutError("Payment gateway error: " + error);
        setCheckoutStep("error");
      };

      // 3. Initiate payment modal
      window.payhere.startPayment(config);

    } catch (err) {
      console.error("Payment API Error:", err);
      setCheckoutError("Unable to connect to payment gateway. Please check connection.");
      setCheckoutStep("error");
    }
  };

  const fetchDashboardData = () => {
    let driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }

    fetch(`http://localhost/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { driver, statistics, active_ride, new_request, recent_rides } = res.data;
          if (driver) {
            setDriverInfo(driver);
            setIsOnline(driver.status === "online");

            // Sync current location name
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  try {
                    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
                    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`;
                    const geoRes = await fetch(geocodeUrl);
                    const geoData = await geoRes.json();
                    
                    let address = null;
                    if (geoData.features && geoData.features.length > 0) {
                      address = geoData.features[0].place_name;
                    }

                    if (!address) {
                      address = driver.town || driver.district || "Colombo";
                    }

                    // Update DB with GPS location name
                    await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        driver_id: driverId,
                        location: address,
                        latitude: latitude,
                        longitude: longitude
                      })
                    });
                  } catch (err) {
                    console.error("Error geocoding or updating location:", err);
                    try {
                      await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          driver_id: driverId,
                          location: driver.town || driver.district || "Colombo",
                          latitude: latitude,
                          longitude: longitude
                        })
                      });
                    } catch (fallbackErr) {
                      console.error("Error setting fallback location:", fallbackErr);
                    }
                  }
                },
                async (error) => {
                  console.error("GPS blocked/failed, falling back to registered town:", error);
                  try {
                    await fetch("http://localhost/Driverdashboard/api/update_location.php", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        driver_id: driverId,
                        location: driver.town || driver.district || "Colombo",
                        latitude: 6.9271,
                        longitude: 79.8612
                      })
                    });
                  } catch (err) {
                    console.error("Error setting fallback location:", err);
                  }
                }
              );
            }
          }
          if (statistics) {
            setStatistics(statistics);
          }
          if (active_ride) {
            setActiveRide({
              pickup: active_ride.pickup,
              dropoff: active_ride.dropoff,
              fare: "Rs. " + parseFloat(active_ride.fare).toFixed(2)
            });
          } else {
            setActiveRide(null);
          }
          if (recent_rides) {
            setRecentRides(recent_rides);
          }
          if (new_request) {
            setRideRequest({
              id: new_request.id,
              passengerName: new_request.passenger_name || "Passenger",
              pickup: new_request.pickup,
              dropoff: new_request.dropoff,
              distance: new_request.distance + " km",
              duration: "10 mins",
              fare: "Rs. " + parseFloat(new_request.fare).toFixed(2)
            });
            setShowRequestPopup(true);
          } else {
            setShowRequestPopup(false);
          }
        }
      })
      .catch(() => {
        // ignore fetch errors
      });
  };

  useEffect(() => {
    fetchDashboardData();

    // Poll every 4 seconds to check for new request card overlays
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("driverOnlineStatus", JSON.stringify(isOnline));
  }, [isOnline]);

  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    const driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    if (driverId) {
      fetch("http://localhost/Driverdashboard/api/update_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driverId,
          status: newStatus ? "online" : "offline"
        })
      }).catch((err) => console.error("Error updating online status:", err));
    }
  };

  const acceptRide = () => {
    const driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    fetch("http://localhost/Driverdashboard/api/accept.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        driver_id: driverId,
        ride_id: rideRequest.id
      })
    })
      .then(() => {
        setShowRequestPopup(false);
        navigate("/ride");
      })
      .catch((err) => console.error("Error accepting ride:", err));
  };

  const rejectRide = () => {
    const driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    fetch("http://localhost/Driverdashboard/api/reject.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        driver_id: driverId,
        ride_id: rideRequest.id
      })
    })
      .then(() => {
        setShowRequestPopup(false);
        fetchDashboardData();
      })
      .catch((err) => console.error("Error rejecting ride:", err));
  };

  return (
    <div className="bg-slate-100 min-h-full flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-slate-100 sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#FEC329]">Access</span>
          <span className="text-[#0B2F89]">Ride</span>
        </h1>
        <img 
          src={driverInfo.profile_image ? `http://localhost/admin/uploads/${driverInfo.profile_image}` : "/src/Driverdashboard/drivering.webp"} 
          alt="Driver avatar" 
          className="h-10 w-10 rounded-full object-cover shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-2 border-white bg-white" 
          onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
        />
      </header>

      <main className="flex-1 px-5 pb-5 flex flex-col gap-4">
        {/* Subscription Expired Warning Banner */}
        {statistics.subscription_status === 'expired' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col gap-1.5 border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm">
              <span className="text-base">⚠️</span>
              <p>Membership Subscription Expired</p>
            </div>
            <p className="text-xs text-red-650 font-bold leading-relaxed">
              Your driver membership has expired (expiry date: <span className="underline">{statistics.subscription_expires_at}</span>). 
              Please renew your subscription to continue receiving bookings.
            </p>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="mt-3 w-full bg-red-650 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              💳 Renew Subscription Now
            </button>
          </div>
        )}

        {/* Welcome Card */}
        <div className="flex items-start justify-between gap-4 bg-white border border-slate-300 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div>
            <p className="text-sm font-extrabold text-[#0B2F89]">Good Morning, {driverInfo.first_name}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#0B2F89]">
              <span className="rounded-full bg-[#FEC329] px-3 py-1 font-bold">⭐ {statistics.rating}</span>
              <span className="font-bold flex items-center bg-slate-100 rounded-full px-3 py-1">{statistics.total_trips} Trips</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Earnings</p>
            <p className="mt-1 text-xl font-extrabold text-[#0B2F89]">Rs. {Number(statistics.today_earnings).toFixed(2)}</p>
            <p className="text-xs text-[#0B2F89] font-bold mt-1">{statistics.today_trips} Completed</p>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between bg-white border border-slate-300 rounded-2xl py-4 px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 text-[#0B2F89]">
            <span className={`h-3 w-3 rounded-full ${isOnline ? "bg-[#FEC329] animate-pulse" : "bg-slate-300"}`}></span>
            <p className="text-lg font-extrabold">Status: {isOnline ? "Online" : "Offline"}</p>
          </div>
          <button
            onClick={toggleStatus}
            className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors ${isOnline ? "bg-[#FEC329]" : "bg-slate-300"}`}
          >
            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${isOnline ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Active Ride Card */}
        {activeRide && (
          <div className="bg-[#FEC329] bg-opacity-10 border border-[#FEC329] rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/ride")}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-[#0B2F89] tracking-wider uppercase">ONGOING RIDE</p>
              <p className="text-base font-extrabold text-[#0B2F89]">{activeRide.fare}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-slate-600 font-bold text-[10px] tracking-wider uppercase mb-1">Pickup</p>
                <p className="font-extrabold text-[#0B2F89] truncate">{activeRide.pickup}</p>
              </div>
              <div>
                <p className="text-slate-600 font-bold text-[10px] tracking-wider uppercase mb-1">Dropoff</p>
                <p className="font-extrabold text-[#0B2F89] truncate">{activeRide.dropoff}</p>
              </div>
            </div>
            <div className="mt-4 text-center text-sm font-extrabold text-[#0B2F89] bg-white border border-slate-200 py-2.5 rounded-xl shadow-sm">
              Tap to view details &rarr;
            </div>
          </div>
        )}

        {/* MONTHLY EARNINGS & SUBSCRIPTION INFO CARD */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-[#0B2F89] text-lg">Earnings & Subscription</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Month</p>
              <p className="mt-1 text-lg font-extrabold text-[#0B2F89]">Rs. {Number(statistics.current_month_earnings || 0).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Previous Month</p>
              <p className="mt-1 text-lg font-extrabold text-[#0B2F89]">Rs. {Number(statistics.prev_month_earnings || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subscription Expiry</p>
              <p className="mt-1 text-sm font-extrabold text-[#0B2F89]">
                {statistics.subscription_expires_at || "No Active Plan"}
                {statistics.subscription_status === 'expired' && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-extrabold">Expired</span>}
              </p>
            </div>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-[#0B2F89] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              Renew
            </button>
          </div>
        </div>

        {/* RECENT RIDES SECTION */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-[#0B2F89] text-lg">Recent Rides</h3>
            <span className="text-[10px] bg-slate-100 text-[#0B2F89] px-2 py-0.5 rounded-full font-bold">Last 5 Trips</span>
          </div>
          <div className="mt-4 space-y-3">
            {recentRides.length === 0 ? (
              <div className="text-center py-8">
                <FiTruck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-bold">No recent rides found.</p>
              </div>
            ) : (
              recentRides.map((ride) => (
                <div key={ride.id} className="flex justify-between items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#0B2F89] text-sm truncate">{ride.passenger_name || "Passenger"}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        ride.status === 'completed' ? 'bg-[#FEC329] text-[#0B2F89]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 pt-1 font-medium">
                      <span className="text-[#FEC329] text-[10px]">●</span> {ride.pickup_location}
                    </p>
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 font-medium">
                      <span className="text-[#0B2F89] text-[10px]">●</span> {ride.dropoff_location}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold pt-1">{ride.ride_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#0B2F89] text-sm">Rs. {parseFloat(ride.fare).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* INCOMING REQUEST MODAL POPUP */}
      {showRequestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-5 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-300 space-y-5 transform scale-100 transition-transform duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-[#FEC329] animate-ping"></span>
                <h2 className="text-sm font-extrabold text-[#0B2F89] uppercase tracking-widest">Incoming Ride</h2>
              </div>
              <span className="text-lg font-extrabold text-[#0B2F89]">{rideRequest.fare}</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Passenger</p>
                <p className="mt-1 text-base font-extrabold text-[#0B2F89]">{rideRequest.passengerName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{rideRequest.pickup}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dropoff</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{rideRequest.dropoff}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>📍 {rideRequest.distance}</span>
                <span>⏱ {rideRequest.duration}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={rejectRide}
                className="flex items-center justify-center bg-white border border-slate-300 rounded-2xl py-3.5 px-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform text-[#0B2F89] font-extrabold text-sm"
              >
                Reject
              </button>
              <button
                onClick={acceptRide}
                className="flex items-center justify-center bg-[#FEC329] border border-[#FEC329] rounded-2xl py-3.5 px-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform text-[#0B2F89] font-extrabold text-sm"
              >
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Payment Gateway Modal Overlay */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setShowCheckoutModal(false); setCheckoutStep("form"); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 font-bold p-1 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            {checkoutStep === "form" && (
              <div className="space-y-4 text-center">
                <div className="pb-2 border-b border-slate-100">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                    <FiCreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0B2F89]">PayHere Payment</h3>
                  <p className="text-xs text-slate-500 font-medium font-sans">Renew Driver Subscription</p>
                  <p className="text-lg font-black text-[#0B2F89] mt-1">Rs. 3,000.00 / mo</p>
                </div>

                {checkoutError && (
                  <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                    ⚠️ {checkoutError}
                  </div>
                )}

                <div className="py-2 text-left space-y-2">
                  <p className="text-xs text-slate-650 font-bold leading-normal">
                    This will open PayHere's secure sandbox checkout portal. You can complete the payment using sandbox credit cards or eZ Cash.
                  </p>
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 flex flex-col gap-1">
                    <p>• Currency: LKR</p>
                    <p>• Gateway Mode: PayHere Sandbox</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <FiLock className="w-3.5 h-3.5" /> Secure Checkout by PayHere
                </div>

                <button 
                  onClick={submitPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
                >
                  🚀 Launch Checkout Portal
                </button>
              </div>
            )}

            {checkoutStep === "processing" && (
              <div className="text-center py-8 space-y-4">
                <FiLoader className="w-12 h-12 text-[#0B2F89] animate-spin mx-auto" />
                <h4 className="text-base font-extrabold text-[#0B2F89]">Processing Secure Payment</h4>
                <p className="text-xs text-slate-500 font-medium">Please do not refresh or close the page...</p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                  <FiCheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-emerald-600">Payment Successful!</h4>
                <p className="text-xs text-slate-650 font-bold">Your driver membership has been successfully renewed.</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 inline-block">
                  Txn ID: {txnId}
                </div>
              </div>
            )}

            {checkoutStep === "error" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-550">
                  ⚠️
                </div>
                <h4 className="text-base font-extrabold text-red-700">Payment Failed</h4>
                <p className="text-xs text-slate-550 font-bold">{checkoutError || "An unexpected error occurred."}</p>
                <button 
                  onClick={() => setCheckoutStep("form")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
