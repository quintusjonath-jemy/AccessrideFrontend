import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Car, Eye, Trash2, UserPlus, Pencil, EyeClosed, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";

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

  const handleShowDriverDetails = async (driverId) => {
    setFetchingDriverId(driverId);
    try {
      const res = await axios.get(`http://localhost/admin/api/drivers.php?id=${driverId}`);
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
      .get("http://localhost/admin/api/drivers.php")

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
        "http://localhost/admin/api/drivers.php",
        newDriver,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          "http://localhost/admin/api/drivers.php",
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
        "http://localhost/admin/api/drivers.php",
        selectedDriver,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          "http://localhost/admin/api/drivers.php",
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
        `http://localhost/admin/api/drivers.php?id=${id}`,
      );

      if (res.data.success) {
        const refresh = await axios.get(
          "http://localhost/admin/api/drivers.php",
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
      `http://localhost/admin/api/drivers.php?block=${driver.id}`,
    );

    const refresh = await axios.get("http://localhost/admin/api/drivers.php");

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
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center">
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

                          <p className="text-sm text-gray-400 dark:text-slate-450">
                            {driver.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-slate-200">
                          {driver.vehicle_number || driver.vehicle}
                        </p>

                        <p className="text-sm text-gray-400 dark:text-slate-550">
                          {driver.vehicle_type || "Vehicle"}
                        </p>
                      </div>
                    </td>

                    {/* PHONE */}

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{driver.phone}</td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[driverStatus] ||
                          "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    {/* SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
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

                    {/* LOCATION */}
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      📍 {driver.current_location || "Unknown"}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleDriverStatus(driver)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                            driver.status?.toLowerCase() === "blocked"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/40 dark:text-blue-450 dark:hover:bg-blue-900/40"
                          }`}
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
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(driver.id)}
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
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => {
                  setSelectedDriver(detailedDriver);
                  setShowDetailsModal(false);
                  setShowEditModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition font-bold text-sm shadow-sm"
              >
                Edit Profile
              </button>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
