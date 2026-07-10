import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiHelpCircle, FiLogOut, FiChevronRight, FiStar, FiAward, FiShield } from "react-icons/fi";

const DriverProfile = () => {
  const navigate = useNavigate();
  const [driverInfo, setDriverInfo] = useState({
    first_name: "Driver",
    last_name: "Profile",
    email: "",
    phone: "",
    profile_image: "",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_number: ""
  });
  const [statistics, setStatistics] = useState({
    rating: 4.8,
    total_trips: 0,
    years: 0.1
  });

  useEffect(() => {
    const driverId = sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }

    fetch(`http://localhost/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { driver, statistics } = res.data;
          if (driver) {
            setDriverInfo(driver);
          }
          if (statistics) {
            // Calculate membership years based on registration created_at date
            const registrationDate = driver.created_at ? new Date(driver.created_at) : new Date();
            const diffTime = Math.abs(new Date() - registrationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const years = (diffDays / 365).toFixed(1);
            setStatistics({
              rating: statistics.rating,
              total_trips: statistics.total_trips,
              years: parseFloat(years) > 0.1 ? years : "0.1"
            });
          }
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("driver_id");
    navigate("/driver-login");
  };

  return (
    <>
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

      <div className="px-5 py-6 flex flex-col items-center bg-white border-b border-slate-100">
        <div className="relative">
          <img
            src={driverInfo.profile_image ? `http://localhost/admin/uploads/${driverInfo.profile_image}` : "/src/Driverdashboard/drivering.webp"}
            alt="Driver"
            className="h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-slate-50"
            onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
          />
          <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-white">
            <FiShield className="text-white h-4 w-4" />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          {driverInfo.first_name} {driverInfo.last_name}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {driverInfo.vehicle_brand || "No Brand"} {driverInfo.vehicle_model || "No Model"} - {driverInfo.vehicle_number || "No Plate"}
        </p>

        <div className="mt-6 w-full flex justify-between bg-slate-50 p-4 rounded-3xl ring-1 ring-slate-200">
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-xl font-bold text-slate-900">{statistics.rating}</span>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FiStar className="text-amber-500" /> Rating</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-xl font-bold text-slate-900">{statistics.total_trips}</span>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FiAward className="text-emerald-500" /> Trips</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-xl font-bold text-slate-900">{statistics.years}</span>
            <span className="text-xs text-slate-500 mt-1">Years</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Settings</p>

        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiUser className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Personal Information</p>
              <p className="text-xs text-slate-500">Edit your name, phone, & email</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiSettings className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Preferences</p>
              <p className="text-xs text-slate-500">App settings, notifications</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiHelpCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Support</p>
              <p className="text-xs text-slate-500">Help center, FAQs, contact us</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100 mt-8"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full text-rose-600 ring-1 ring-rose-200">
              <FiLogOut className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-rose-700">Log Out</p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default DriverProfile;
