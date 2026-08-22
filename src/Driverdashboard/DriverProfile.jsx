import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser, FiLogOut, FiStar, FiAward, FiShield, FiPhone, FiMail,
  FiCalendar, FiTruck, FiEdit2, FiCheckCircle, FiLoader, FiAlertCircle,
  FiMapPin, FiClock
} from "react-icons/fi";
import DriverHeader from "./components/DriverHeader";
import API_BASE from "../config/api";

const InfoRow = ({ icon: Icon, label, value, highlight = false }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className={`p-2 rounded-lg ${highlight ? "bg-blue-50 text-[#0B2F89]" : "bg-slate-100 text-slate-500"}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-extrabold truncate ${highlight ? "text-[#0B2F89]" : "text-slate-700"}`}>
        {value || <span className="text-slate-300 font-medium italic">Not set</span>}
      </p>
    </div>
  </div>
);

const DriverProfile = () => {
  const navigate = useNavigate();

  const [driverInfo, setDriverInfo] = useState({
    id: null,
    first_name: "Driver",
    last_name: "",
    email: "",
    phone: "",
    profile_image: "",
    status: "",
    created_at: "",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_number: "",
    vehicle_type: "",
    vehicle_color: "",
    year_manufacture: ""
  });

  const [statistics, setStatistics] = useState({
    rating: 4.8,
    total_trips: 0,
    today_earnings: 0,
    current_month_earnings: 0,
    subscription_status: "",
    subscription_expires_at: ""
  });

  const [years, setYears] = useState("0.1");
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchProfile = useCallback(() => {
    let driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }

    fetch(`${API_BASE}/Driverdashboard/api/dashboard.php?driver_id=${driverId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { driver, statistics } = res.data;
          if (driver) {
            setDriverInfo(driver);
            setEditForm({
              first_name: driver.first_name || "",
              last_name: driver.last_name || "",
              email: driver.email || "",
              phone: driver.phone || ""
            });
            // Calculate membership years
            const registrationDate = driver.created_at ? new Date(driver.created_at) : new Date();
            const diffDays = Math.ceil((new Date() - registrationDate) / (1000 * 60 * 60 * 24));
            const yrs = (diffDays / 365).toFixed(1);
            setYears(parseFloat(yrs) > 0.1 ? yrs : "0.1");
          }
          if (statistics) {
            setStatistics(statistics);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem("driver_id");
    sessionStorage.removeItem("driver_id");
    navigate("/driver-login");
  };

  const openEditModal = () => {
    setEditError("");
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");
    setEditSuccess(false);

    const driverId = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id");

    try {
      const response = await fetch(`${API_BASE}/Driverdashboard/api/update_profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: driverId, ...editForm })
      });
      const res = await response.json();
      if (res.success) {
        setEditSuccess(true);
        fetchProfile();
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess(false);
        }, 1800);
      } else {
        setEditError(res.message || "Failed to update profile.");
      }
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-[#0B2F89] animate-spin" />
      </div>
    );
  }

  const statusColor = driverInfo.status === "online"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-500";

  const subStatusColor = statistics.subscription_status === "active"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-red-100 text-red-700";

  return (
    <>
      <DriverHeader driverInfo={driverInfo} />

      <div className="bg-slate-50 min-h-screen pb-28">

        {/* Profile Header Card */}
        <div className="mx-5 mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={driverInfo.profile_image
                  ? `${API_BASE}/admin/uploads/${driverInfo.profile_image}`
                  : "/src/Driverdashboard/drivering.webp"}
                alt="Driver"
                className="h-20 w-20 rounded-full object-cover shadow ring-4 ring-slate-100"
                onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
              />
              <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1 border-2 border-white">
                <FiShield className="text-white h-3 w-3" />
              </div>
            </div>

            {/* Name & badges */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-[#0B2F89] leading-tight truncate">
                {driverInfo.first_name} {driverInfo.last_name}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Driver ID: #{driverInfo.id}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                  {driverInfo.status || "offline"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${subStatusColor}`}>
                  Sub: {statistics.subscription_status || "No Plan"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip inside the card */}
          <div className="border-t border-slate-100 flex divide-x divide-slate-100">
            <div className="flex flex-col items-center flex-1 py-3 px-2">
              <span className="text-base font-black text-[#0B2F89]">{statistics.rating}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <FiStar className="text-amber-400" /> Rating
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 py-3 px-2">
              <span className="text-base font-black text-[#0B2F89]">{statistics.total_trips}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <FiAward className="text-emerald-500" /> Trips
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 py-3 px-2">
              <span className="text-base font-black text-[#0B2F89]">{years}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <FiCalendar className="text-blue-400" /> Years
              </span>
            </div>
            <div className="flex flex-col items-center flex-1 py-3 px-2">
              <span className="text-base font-black text-[#0B2F89]">
                Rs.{Number(statistics.today_earnings || 0).toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Today</span>
            </div>
          </div>
        </div>

        <div className="px-5 mt-5 space-y-4">

          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-[#0B2F89]" />
                <h3 className="text-sm font-extrabold text-[#0B2F89]">Personal Information</h3>
              </div>
              <button
                onClick={openEditModal}
                className="flex items-center gap-1.5 bg-[#0B2F89] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FiEdit2 className="w-3 h-3" /> Edit
              </button>
            </div>
            <div className="px-5">
              <InfoRow icon={FiUser} label="Full Name" value={`${driverInfo.first_name} ${driverInfo.last_name}`} highlight />
              <InfoRow icon={FiMail} label="Email Address" value={driverInfo.email} highlight />
              <InfoRow icon={FiPhone} label="Phone Number" value={driverInfo.phone} highlight />
              <InfoRow icon={FiCalendar} label="Member Since" value={driverInfo.created_at ? new Date(driverInfo.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
              <InfoRow icon={FiShield} label="Account Status" value={driverInfo.status ? driverInfo.status.charAt(0).toUpperCase() + driverInfo.status.slice(1) : "Unknown"} />
            </div>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-100">
              <FiTruck className="w-4 h-4 text-[#0B2F89]" />
              <h3 className="text-sm font-extrabold text-[#0B2F89]">Vehicle Information</h3>
            </div>
            <div className="px-5">
              <InfoRow icon={FiTruck} label="Vehicle Brand" value={driverInfo.vehicle_brand} />
              <InfoRow icon={FiTruck} label="Vehicle Model" value={driverInfo.vehicle_model} />
              <InfoRow icon={FiMapPin} label="License Plate" value={driverInfo.vehicle_number} highlight />
              <InfoRow icon={FiShield} label="Vehicle Type" value={driverInfo.vehicle_type} />
              <InfoRow icon={FiAward} label="Color" value={driverInfo.vehicle_color} />
              <InfoRow icon={FiCalendar} label="Year of Manufacture" value={driverInfo.year_manufacture} />
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-100">
              <FiClock className="w-4 h-4 text-[#0B2F89]" />
              <h3 className="text-sm font-extrabold text-[#0B2F89]">Subscription</h3>
            </div>
            <div className="px-5">
              <InfoRow
                icon={FiShield}
                label="Subscription Status"
                value={statistics.subscription_status ? statistics.subscription_status.toUpperCase() : "No Plan"}
                highlight={statistics.subscription_status === "active"}
              />
              <InfoRow
                icon={FiCalendar}
                label="Expires On"
                value={statistics.subscription_expires_at || "No Active Plan"}
              />
              <InfoRow
                icon={FiAward}
                label="Monthly Earnings"
                value={`Rs. ${Number(statistics.current_month_earnings || 0).toFixed(2)}`}
              />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 hover:bg-red-100 transition shadow-sm"
          >
            <div className="bg-white p-3 rounded-full text-red-600 ring-1 ring-red-200">
              <FiLogOut className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-red-700">Log Out</p>
              <p className="text-xs text-red-400">Sign out of your driver account</p>
            </div>
          </button>

        </div>
      </div>

      {/* Edit Personal Information Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center pb-3 border-b border-slate-100 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#0B2F89]">
                <FiEdit2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0B2F89]">Edit Profile</h3>
              <p className="text-xs text-slate-400 font-medium">Update your personal information</p>
            </div>

            {editError && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 mb-4">
                <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-200 mb-4">
                <FiCheckCircle className="w-4 h-4 shrink-0" />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0B2F89] focus:outline-none focus:border-[#0B2F89]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0B2F89] focus:outline-none focus:border-[#0B2F89]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0B2F89] focus:outline-none focus:border-[#0B2F89]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0B2F89] focus:outline-none focus:border-[#0B2F89]"
                />
              </div>

              <button
                type="submit"
                disabled={editSaving}
                className="w-full bg-[#0B2F89] hover:bg-blue-900 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {editSaving ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DriverProfile;
