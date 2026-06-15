import axios from "axios";
import { useEffect, useState } from "react";
import { Car, Eye, Trash2, UserPlus, Pencil, EyeClosed, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Driver Management
          </h1>
          <p className="text-gray-500 mt-1">
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
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, phone, or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
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
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer max-w-[200px] capitalize"
          >
            <option value="all">All Vehicles</option>
            {uniqueVehicles.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DRIVER TABLE */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Driver
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Vehicle
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Phone
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Subscription
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Location
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-400">
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
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* DRIVER */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-yellow-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {driver.name}
                          </p>

                          <p className="text-sm text-gray-400">
                            {driver.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td className="px-6 py-4 text-gray-600">
                      <div>
                        <p className="font-medium">
                          {driver.vehicle_number || driver.vehicle}
                        </p>

                        <p className="text-sm text-gray-400">
                          {driver.vehicle_type || "Vehicle"}
                        </p>
                      </div>
                    </td>

                    {/* PHONE */}

                    <td className="px-6 py-4 text-gray-600">{driver.phone}</td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[driverStatus] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    {/* SUBSCRIPTION */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {driver.subscription_status === "active" ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : driver.subscription_status === "expired" ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full w-fit">
                            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                            Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full w-fit border border-gray-100">
                            No Membership
                          </span>
                        )}
                        {driver.subscription_expires_at && driver.subscription_status !== "none" && (
                          <span className="text-[11px] text-gray-400 font-medium pl-1">
                            {driver.subscription_status === "active" ? "Renews" : "Expired"}: {driver.subscription_expires_at}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-4 text-gray-500">
                      📍 {driver.current_location || "Unknown"}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleDriverStatus(driver)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                            driver.status?.toLowerCase() === "blocked"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
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
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Driver
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the driver details below to create a new profile
              </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter driver name"
                  value={newDriver.name}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={newDriver.email}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={newDriver.phone}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="Enter vehicle number"
                  value={newDriver.vehicle_number}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicle_type"
                  placeholder="Enter vehicle type"
                  value={newDriver.vehicle_type}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Location
                </label>
                <input
                  type="text"
                  name="current_location"
                  placeholder="Enter current location"
                  value={newDriver.current_location}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  value={newDriver.status}
                  onChange={handleAddChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                >
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* SUBSCRIPTION SETTINGS */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-500" />
                    Membership & Subscription
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage the driver's monthly membership payment configuration</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Subscription Status
                  </label>
                  <select
                    name="subscription_status"
                    value={newDriver.subscription_status}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  >
                    <option value="none">No Membership</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Monthly Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="subscription_amount"
                    value={newDriver.subscription_amount}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="subscription_expires_at"
                    value={newDriver.subscription_expires_at}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Last Payment Date
                  </label>
                  <input
                    type="date"
                    name="last_payment_date"
                    value={newDriver.last_payment_date}
                    onChange={handleAddChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
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
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Driver</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update driver details and save changes
              </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={selectedDriver.name}
                  onChange={handleEditChange}
                  placeholder="Enter driver name"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={selectedDriver.email}
                  onChange={handleEditChange}
                  placeholder="Enter email"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={selectedDriver.phone}
                  onChange={handleEditChange}
                  placeholder="Enter phone number"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  value={selectedDriver.vehicle_number}
                  onChange={handleEditChange}
                  placeholder="Enter vehicle number"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicle_type"
                  value={selectedDriver.vehicle_type}
                  onChange={handleEditChange}
                  placeholder="Enter vehicle type"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Location
                </label>
                <input
                  type="text"
                  name="current_location"
                  value={selectedDriver.current_location}
                  onChange={handleEditChange}
                  placeholder="Enter current location"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  value={selectedDriver.status}
                  onChange={handleEditChange}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                >
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* SUBSCRIPTION SETTINGS */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-500" />
                    Membership & Subscription
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage the driver's monthly membership payment configuration</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Subscription Status
                  </label>
                  <select
                    name="subscription_status"
                    value={selectedDriver.subscription_status || "none"}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  >
                    <option value="none">No Membership</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Monthly Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="subscription_amount"
                    value={selectedDriver.subscription_amount || 0.00}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="subscription_expires_at"
                    value={selectedDriver.subscription_expires_at || ""}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Last Payment Date
                  </label>
                  <input
                    type="date"
                    name="last_payment_date"
                    value={selectedDriver.last_payment_date || ""}
                    onChange={handleEditChange}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
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
    </div>
  );
};

export default Drivers;
