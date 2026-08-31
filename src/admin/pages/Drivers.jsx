import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Car,
  Eye,
  Trash2,
  UserPlus,
  Pencil,
  EyeClosed,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  ExternalLink,
  Download,
} from "lucide-react";
import API_BASE from "../../config/api";

const getDocumentImageUrl = (folder, filename) => {
  if (!filename) return null;
  if (filename.startsWith("http://") || filename.startsWith("https://") || filename.startsWith("data:")) {
    return filename;
  }
  return `${API_BASE}/login/uploads/${folder}/${filename}`;
};

const Drivers = () => {
  const location = useLocation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(location.state?.searchQuery || "");

  useEffect(() => {
    if (location.state?.searchQuery !== undefined) {
      setSearch(location.state.searchQuery);
    }
  }, [location.state]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedDriver, setDetailedDriver] = useState(null);
  const [fetchingDriverId, setFetchingDriverId] = useState(null);

  // Document Verification State
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedDocDriver, setSelectedDocDriver] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState("all");
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleShowDriverDetails = async (driverId) => {
    setFetchingDriverId(driverId);
    try {
      const res = await axios.get(`${API_BASE}/admin/api/drivers.php?id=${driverId}`);
      if (res.data) {
        setDetailedDriver(res.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error("Failed to load driver details:", err);
      alert("Failed to fetch driver details");
    } finally {
      setFetchingDriverId(null);
    }
  };

  const handleShowDriverDocs = async (driverId) => {
    setFetchingDriverId(driverId);
    try {
      const res = await axios.get(`${API_BASE}/admin/api/drivers.php?id=${driverId}`);
      if (res.data) {
        setSelectedDocDriver(res.data);
        setShowDocsModal(true);
      }
    } catch (err) {
      console.error("Failed to load driver documents:", err);
      alert("Failed to fetch driver documents");
    } finally {
      setFetchingDriverId(null);
    }
  };

  const handleApproveDriver = async (driver) => {
    try {
      const res = await axios.put(`${API_BASE}/admin/api/drivers.php`, {
        ...driver,
        status: "online",
      });
      if (res.data.success) {
        alert(`Driver ${driver.name} has been verified and activated!`);
        const refresh = await axios.get(`${API_BASE}/admin/api/drivers.php`);
        setDrivers(refresh.data);
        if (selectedDocDriver?.id === driver.id) {
          setSelectedDocDriver({ ...selectedDocDriver, status: "online" });
        }
        if (detailedDriver?.id === driver.id) {
          setDetailedDriver({ ...detailedDriver, status: "online" });
        }
      }
    } catch (err) {
      console.error("Failed to approve driver:", err);
      alert("Failed to update driver status");
    }
  };

  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle_number: "",
    vehicle_type: "",
    status: "offline",
    current_location: "",
    subscription_status: "none",
    subscription_expires_at: "",
    last_payment_date: "",
    subscription_amount: 29.99,
  });

  const [selectedDriver, setSelectedDriver] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    vehicle_number: "",
    vehicle_type: "",
    status: "",
    current_location: "",
    subscription_status: "none",
    subscription_expires_at: "",
    last_payment_date: "",
    subscription_amount: 29.99,
  });

  // FETCH DRIVERS
  useEffect(() => {
    axios
      .get(`${API_BASE}/admin/api/drivers.php`)

      .then((res) => {
        setDrivers(Array.isArray(res.data) ? res.data : []);

        setLoading(false);
      })

      .catch((err) => {
        console.log(err);

        setLoading(false);
      });
  }, []);

  // STATUS COLORS
  const statusStyles = {
    online: "bg-green-100 text-green-700",
    busy: "bg-yellow-100 text-yellow-700",
    offline: "bg-gray-100 text-gray-700",
    blocked: "bg-red-100 text-red-700",
  };

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");

  const uniqueVehicles = Array.from(new Set(drivers.map(d => d.vehicle_type).filter(Boolean))).sort();

  const filteredDrivers = drivers.filter((driver) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchLower) ||
      driver.email?.toLowerCase().includes(searchLower) ||
      driver.vehicle_number?.toLowerCase().includes(searchLower) ||
      driver.phone?.includes(search) ||
      driver.vehicle_type?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all" ||
      driver.status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesVehicle =
      filterVehicle === "all" ||
      driver.vehicle_type?.toLowerCase() === filterVehicle.toLowerCase();

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const handleAddChange = (e) => {
    setNewDriver({
      ...newDriver,
      [e.target.name]: e.target.value,
    });
  };

  const addDriver = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/admin/api/drivers.php`,
        newDriver,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          `${API_BASE}/admin/api/drivers.php`,
        );

        setDrivers(refresh.data);

        setShowAddModal(false);

        setNewDriver({
          name: "",
          email: "",
          phone: "",
          vehicle_number: "",
          vehicle_type: "",
          status: "offline",
          current_location: "",
          subscription_status: "none",
          subscription_expires_at: "",
          last_payment_date: "",
          subscription_amount: 29.99,
        });

        alert("Driver added successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditChange = (e) => {
    setSelectedDriver({
      ...selectedDriver,
      [e.target.name]: e.target.value,
    });
  };

  const updateDriver = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/api/drivers.php`,
        selectedDriver,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          `${API_BASE}/admin/api/drivers.php`,
        );

        setDrivers(refresh.data);

        setShowEditModal(false);

        alert("Driver updated successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this driver?",
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${API_BASE}/admin/api/drivers.php?id=${id}`,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          `${API_BASE}/admin/api/drivers.php`,
        );

        setDrivers(refresh.data);

        alert("Driver deleted successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleDriverStatus = async (driver) => {
    const action =
      driver.status?.toLowerCase() === "blocked" ? "unblock" : "block";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} ${driver.name}?`,
    );

    if (!confirmAction) return;

    await axios.get(
      `${API_BASE}/admin/api/drivers.php?block=${driver.id}`,
    );

    const refresh = await axios.get(`${API_BASE}/admin/api/drivers.php`);

    setDrivers(refresh.data);
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex justify-between items-center transition-colors">

        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Driver Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Manage drivers and live vehicle activity
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-colors">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, phone, or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-gray-850 dark:text-slate-105 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-850 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-850 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer max-w-[200px] capitalize"
          >
            <option value="all">All Vehicles</option>
            {uniqueVehicles.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DRIVER TABLE */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900/40">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Driver
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Vehicle
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Phone
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Subscription
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Rating
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Location
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400 dark:text-slate-500">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading drivers...
                  </div>
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => {
                const driverStatus = (driver.status || "").toLowerCase().trim();

                return (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* DRIVER */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center shrink-0">
                          <Car className="w-5 h-5 text-yellow-600 dark:text-yellow-450" />
                        </div>

                        <div>
                          <p 
                            className="font-semibold text-gray-800 dark:text-slate-100 hover:text-yellow-600 hover:underline cursor-pointer flex items-center gap-2"
                            onClick={() => handleShowDriverDetails(driver.id)}
                          >
                            {driver.name}
                            {fetchingDriverId === driver.id && (
                              <span className="w-3.5 h-3.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                            )}
                          </p>

                          <p className="text-xs text-gray-400 dark:text-slate-450">
                            {driver.email}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            {driver.has_documents || driver.license_front ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowDriverDocs(driver.id);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                                title="Click to view submitted documents"
                              >
                                <ShieldCheck className="w-3 h-3" /> Docs Available
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowDriverDocs(driver.id);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-slate-900/40 dark:text-slate-500 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                title="Click to check verification documents"
                              >
                                <FileText className="w-3 h-3" /> Check Docs
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-slate-200">
                          {driver.vehicle_number || driver.vehicle}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-450 capitalize">
                          {driver.vehicle_type || "Standard"}
                        </p>
                      </div>
                    </td>

                    {/* PHONE */}

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 text-sm">
                      {driver.phone}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[driverStatus] ||
                          "bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-350"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    {/* SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {driver.subscription_status === "active" ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-1 rounded-full w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : driver.subscription_status === "expired" ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-full w-fit">
                            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                            Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-slate-900/40 dark:text-slate-400 px-2.5 py-1 rounded-full w-fit border border-gray-100 dark:border-slate-750">
                            No Membership
                          </span>
                        )}
                        {driver.subscription_expires_at && driver.subscription_status !== "none" && (
                          <span className="text-[11px] text-gray-400 dark:text-slate-450 font-medium pl-1">
                            {driver.subscription_status === "active" ? "Renews" : "Expired"}: {driver.subscription_expires_at}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* RATING */}
                    <td className="px-6 py-4">
                      {driver.monthly_rating > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500 dark:text-amber-400">
                          ⭐ {driver.monthly_rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-550 text-xs">N/A</span>
                      )}
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      📍 {driver.current_location || "Unknown"}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleShowDriverDocs(driver.id)}
                          title="View Driver Verification Documents (License, NIC, Vehicle)"
                          disabled={fetchingDriverId === driver.id}
                          className="px-2.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition flex items-center gap-1 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Docs</span>
                        </button>

                        <button
                          onClick={() => toggleDriverStatus(driver)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                            driver.status?.toLowerCase() === "blocked"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/40 dark:text-blue-450 dark:hover:bg-blue-900/40"
                          }`}
                          title={driver.status?.toLowerCase() === "blocked" ? "Unblock Driver" : "Toggle Status"}
                        >
                          {driver.status?.toLowerCase() === "blocked" ? (
                            <EyeClosed className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowEditModal(true);
                          }}
                          title="Edit Driver"
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(driver.id)}
                          title="Delete Driver"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD DRIVER */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                Add New Driver
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Fill in the driver details below to create a new profile
              </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter driver name"
                  value={newDriver.name}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={newDriver.email}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={newDriver.phone}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="Enter vehicle number"
                  value={newDriver.vehicle_number}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicle_type"
                  placeholder="Enter vehicle type"
                  value={newDriver.vehicle_type}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Location
                </label>
                <input
                  type="text"
                  name="current_location"
                  placeholder="Enter current location"
                  value={newDriver.current_location}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Status
                </label>
                <select
                  name="status"
                  value={newDriver.status}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                >
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* SUBSCRIPTION SETTINGS */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-500" />
                    Membership & Subscription
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-450 mt-0.5">Manage the driver's monthly membership payment configuration</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Subscription Status
                  </label>
                  <select
                    name="subscription_status"
                    value={newDriver.subscription_status}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  >
                    <option value="none">No Membership</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Monthly Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="subscription_amount"
                    value={newDriver.subscription_amount}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="subscription_expires_at"
                    value={newDriver.subscription_expires_at}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Last Payment Date
                  </label>
                  <input
                    type="date"
                    name="last_payment_date"
                    value={newDriver.last_payment_date}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={addDriver}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md transition font-semibold"
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DRIVER */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Edit Driver</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Update driver details and save changes
              </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={selectedDriver.name}
                  onChange={handleEditChange}
                  placeholder="Enter driver name"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={selectedDriver.email}
                  onChange={handleEditChange}
                  placeholder="Enter email"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={selectedDriver.phone}
                  onChange={handleEditChange}
                  placeholder="Enter phone number"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  value={selectedDriver.vehicle_number}
                  onChange={handleEditChange}
                  placeholder="Enter vehicle number"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicle_type"
                  value={selectedDriver.vehicle_type}
                  onChange={handleEditChange}
                  placeholder="Enter vehicle type"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Location
                </label>
                <input
                  type="text"
                  name="current_location"
                  value={selectedDriver.current_location}
                  onChange={handleEditChange}
                  placeholder="Enter current location"
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Status
                </label>
                <select
                  name="status"
                  value={selectedDriver.status}
                  onChange={handleEditChange}
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                >
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* SUBSCRIPTION SETTINGS */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-500" />
                    Membership & Subscription
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-450 mt-0.5">Manage the driver's monthly membership payment configuration</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Subscription Status
                  </label>
                  <select
                    name="subscription_status"
                    value={selectedDriver.subscription_status || "none"}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  >
                    <option value="none">No Membership</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Monthly Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="subscription_amount"
                    value={selectedDriver.subscription_amount || 0.00}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="subscription_expires_at"
                    value={selectedDriver.subscription_expires_at || ""}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Last Payment Date
                  </label>
                  <input
                    type="date"
                    name="last_payment_date"
                    value={selectedDriver.last_payment_date || ""}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={updateDriver}
                className="px-5 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 shadow-md transition font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER DETAILS MODAL */}
      {showDetailsModal && detailedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {detailedDriver.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Driver profile metrics & settings
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[detailedDriver.status?.toLowerCase()] || "bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-350"}`}>
                {detailedDriver.status}
              </span>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Core Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Contact & Vehicle
                </h3>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Email:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-350 truncate">{detailedDriver.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Phone:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-350">{detailedDriver.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 border-t border-gray-100 dark:border-slate-700/60 pt-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Vehicle No:</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{detailedDriver.vehicle_number || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Vehicle Type:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{detailedDriver.vehicle_type || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Location:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">📍 {detailedDriver.current_location || "Unknown"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Earnings & Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Performance & Earnings
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-sm">
                    <p className="text-xs text-blue-100 font-medium">Completed Rides</p>
                    <p className="text-2xl font-extrabold mt-1 truncate">{detailedDriver.completed_rides_count || 0}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-sm">
                    <p className="text-xs text-green-100 font-medium">Gross Earnings</p>
                    <p className="text-2xl font-extrabold mt-1 truncate">${Number(detailedDriver.gross_earnings || 0).toFixed(2)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-sm">
                    <p className="text-xs text-amber-100 font-medium">Monthly Rating</p>
                    <p className="text-2xl font-extrabold mt-1 truncate">
                      {detailedDriver.monthly_rating > 0 ? `⭐ ${detailedDriver.monthly_rating.toFixed(1)}` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3 mt-2">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Subscription Details
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${detailedDriver.subscription_status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                      {detailedDriver.subscription_status?.toUpperCase() || 'NONE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Monthly Cost:</span>
                    <span className="font-semibold text-gray-700 dark:text-slate-350">${Number(detailedDriver.subscription_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Expiry Date:</span>
                    <span className="font-medium text-gray-750 dark:text-slate-350">{detailedDriver.subscription_expires_at || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => {
                  setSelectedDocDriver(detailedDriver);
                  setShowDetailsModal(false);
                  setShowDocsModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition font-bold text-sm shadow-sm flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                View Verification Documents
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDriver(detailedDriver);
                    setShowDetailsModal(false);
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition font-bold text-sm shadow-sm"
                >
                  Edit Profile
                </button>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER VERIFICATION DOCUMENTS MODAL */}
      {showDocsModal && selectedDocDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden transition-colors my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-gray-50/70 dark:bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-xl shadow-xs">
                  {selectedDocDriver.name?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                      {selectedDocDriver.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[selectedDocDriver.status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                      {selectedDocDriver.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Verification Documents & Identity Inspection • Vehicle: <span className="font-semibold text-gray-700 dark:text-slate-200">{selectedDocDriver.vehicle_number || "N/A"} ({selectedDocDriver.vehicle_type || "Standard"})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedDocDriver.status?.toLowerCase() !== "online" && (
                  <button
                    onClick={() => handleApproveDriver(selectedDocDriver)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Driver
                  </button>
                )}
                <button
                  onClick={() => setShowDocsModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Category Filter Tabs */}
            <div className="px-6 pt-3 pb-2 border-b border-gray-100 dark:border-slate-700 flex gap-2 overflow-x-auto shrink-0 bg-white dark:bg-slate-800">
              {[
                { id: "all", label: "All Documents" },
                { id: "license", label: "Driving License" },
                { id: "nic", label: "NIC / National ID" },
                { id: "registration", label: "Vehicle Reg & Insurance" },
                { id: "vehicle", label: "Vehicle Inspection" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeDocTab === tab.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-750 text-gray-600 dark:text-slate-350 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Documents Content Grid */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50 dark:bg-slate-900/20">
              {/* DRIVING LICENSE SECTION */}
              {(activeDocTab === "all" || activeDocTab === "license") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">🪪</span>
                      Driving License Verification
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-3">
                      <span>License No: <strong className="text-gray-700 dark:text-slate-200">{selectedDocDriver.license_number || "Not provided"}</strong></span>
                      {selectedDocDriver.license_expiry && (
                        <span>Expires: <strong className="text-gray-700 dark:text-slate-200">{selectedDocDriver.license_expiry}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* License Front */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">License (Front Side)</span>
                        {selectedDocDriver.license_front ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.license_front ? (
                          <>
                            <img
                              src={getDocumentImageUrl("licenses", selectedDocDriver.license_front)}
                              alt="License Front"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("licenses", selectedDocDriver.license_front),
                                  title: `${selectedDocDriver.name} - License (Front Side)`,
                                })
                              }
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.querySelector('.img-fallback').classList.remove('hidden');
                              }}
                            />
                            <div className="hidden img-fallback text-center p-4">
                              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">File: {selectedDocDriver.license_front}</p>
                              <a
                                href={getDocumentImageUrl("licenses", selectedDocDriver.license_front)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 underline"
                              >
                                Open Document <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("licenses", selectedDocDriver.license_front),
                                  title: `${selectedDocDriver.name} - License (Front Side)`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No License Front Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* License Back */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">License (Back Side)</span>
                        {selectedDocDriver.license_back ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.license_back ? (
                          <>
                            <img
                              src={getDocumentImageUrl("licenses", selectedDocDriver.license_back)}
                              alt="License Back"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("licenses", selectedDocDriver.license_back),
                                  title: `${selectedDocDriver.name} - License (Back Side)`,
                                })
                              }
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.querySelector('.img-fallback').classList.remove('hidden');
                              }}
                            />
                            <div className="hidden img-fallback text-center p-4">
                              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">File: {selectedDocDriver.license_back}</p>
                              <a
                                href={getDocumentImageUrl("licenses", selectedDocDriver.license_back)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 underline"
                              >
                                Open Document <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("licenses", selectedDocDriver.license_back),
                                  title: `${selectedDocDriver.name} - License (Back Side)`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No License Back Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NIC / NATIONAL ID SECTION */}
              {(activeDocTab === "all" || activeDocTab === "nic") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="p-1 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">🆔</span>
                      National Identity Card (NIC)
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      NIC Number: <strong className="text-gray-700 dark:text-slate-200">{selectedDocDriver.nic || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NIC Front */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">NIC (Front Side)</span>
                        {selectedDocDriver.nic_front ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.nic_front ? (
                          <>
                            <img
                              src={getDocumentImageUrl("nic", selectedDocDriver.nic_front)}
                              alt="NIC Front"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("nic", selectedDocDriver.nic_front),
                                  title: `${selectedDocDriver.name} - NIC (Front Side)`,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("nic", selectedDocDriver.nic_front),
                                  title: `${selectedDocDriver.name} - NIC (Front Side)`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No NIC Front Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NIC Back */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">NIC (Back Side)</span>
                        {selectedDocDriver.nic_back ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.nic_back ? (
                          <>
                            <img
                              src={getDocumentImageUrl("nic", selectedDocDriver.nic_back)}
                              alt="NIC Back"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("nic", selectedDocDriver.nic_back),
                                  title: `${selectedDocDriver.name} - NIC (Back Side)`,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("nic", selectedDocDriver.nic_back),
                                  title: `${selectedDocDriver.name} - NIC (Back Side)`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No NIC Back Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VEHICLE REGISTRATION & INSURANCE SECTION */}
              {(activeDocTab === "all" || activeDocTab === "registration") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="p-1 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">📜</span>
                      Registration & Insurance Compliance
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-3">
                      {selectedDocDriver.registration_expiry && (
                        <span>Reg Expiry: <strong className="text-gray-700 dark:text-slate-200">{selectedDocDriver.registration_expiry}</strong></span>
                      )}
                      {selectedDocDriver.insurance_expiry && (
                        <span>Insurance Expiry: <strong className="text-gray-700 dark:text-slate-200">{selectedDocDriver.insurance_expiry}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Registration Document */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Registration Document (CR)</span>
                        {selectedDocDriver.registration_image ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.registration_image ? (
                          <>
                            <img
                              src={getDocumentImageUrl("registration", selectedDocDriver.registration_image)}
                              alt="Vehicle Registration"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("registration", selectedDocDriver.registration_image),
                                  title: `${selectedDocDriver.name} - Vehicle Registration Certificate`,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("registration", selectedDocDriver.registration_image),
                                  title: `${selectedDocDriver.name} - Vehicle Registration Certificate`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No Registration Document Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Insurance Document */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Insurance Certificate</span>
                        {selectedDocDriver.insurance_image ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-48 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                        {selectedDocDriver.insurance_image ? (
                          <>
                            <img
                              src={getDocumentImageUrl("insurance", selectedDocDriver.insurance_image)}
                              alt="Insurance Certificate"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("insurance", selectedDocDriver.insurance_image),
                                  title: `${selectedDocDriver.name} - Insurance Certificate`,
                                })
                              }
                            />
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: getDocumentImageUrl("insurance", selectedDocDriver.insurance_image),
                                  title: `${selectedDocDriver.name} - Insurance Certificate`,
                                })
                              }
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold"
                            >
                              <ZoomIn className="w-4 h-4" /> Click to Inspect Full Size
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4 text-gray-400 dark:text-slate-550">
                            <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No Insurance Certificate Uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VEHICLE INSPECTION PHOTOS SECTION */}
              {(activeDocTab === "all" || activeDocTab === "vehicle") && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">🚗</span>
                    Vehicle Condition & Exterior/Interior Photos
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "vehicle_front", label: "Front View", file: selectedDocDriver.vehicle_front },
                      { key: "vehicle_rear", label: "Rear View", file: selectedDocDriver.vehicle_rear },
                      { key: "vehicle_interior", label: "Interior View", file: selectedDocDriver.vehicle_interior },
                      { key: "dashboard_photo", label: "Dashboard / Odo", file: selectedDocDriver.dashboard_photo },
                    ].map((item) => (
                      <div key={item.key} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-2.5 shadow-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 truncate">{item.label}</span>
                          {item.file ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <span className="text-[9px] text-amber-500 font-semibold">Missing</span>
                          )}
                        </div>

                        <div className="relative group bg-gray-100 dark:bg-slate-900 rounded-lg h-28 overflow-hidden flex items-center justify-center border border-gray-200/60 dark:border-slate-750">
                          {item.file ? (
                            <>
                              <img
                                src={getDocumentImageUrl("vehicle", item.file)}
                                alt={item.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                                onClick={() =>
                                  setZoomedImage({
                                    url: getDocumentImageUrl("vehicle", item.file),
                                    title: `${selectedDocDriver.name} - ${item.label}`,
                                  })
                                }
                              />
                              <button
                                onClick={() =>
                                  setZoomedImage({
                                    url: getDocumentImageUrl("vehicle", item.file),
                                    title: `${selectedDocDriver.name} - ${item.label}`,
                                  })
                                }
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <Car className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 px-6 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 shrink-0">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Driver ID: <span className="font-mono font-semibold text-gray-700 dark:text-slate-300">#{selectedDocDriver.id}</span>
              </div>

              <div className="flex gap-2.5">
                {selectedDocDriver.status?.toLowerCase() !== "online" && (
                  <button
                    onClick={() => handleApproveDriver(selectedDocDriver)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Activate Driver
                  </button>
                )}

                <button
                  onClick={() => setShowDocsModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700 text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX / INSPECT MODAL */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center z-[100] p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="w-full max-w-5xl flex justify-between items-center mb-3 text-white px-2">
            <span className="text-sm font-semibold truncate">{zoomedImage.title}</span>
            <div className="flex items-center gap-3">
              <a
                href={zoomedImage.url}
                target="_blank"
                rel="noreferrer"
                download
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Open / Download
              </a>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div 
            className="max-w-5xl max-h-[85vh] bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
