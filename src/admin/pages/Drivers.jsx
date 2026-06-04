import axios from "axios";

import { useEffect, useState } from "react";

import { Car, Eye, Trash2, UserPlus, Pencil, EyeClosed } from "lucide-react";

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

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(search.toLowerCase()) ||
      driver.email?.toLowerCase().includes(search.toLowerCase()) ||
      driver.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
      driver.phone?.includes(search),
  );

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
    <div>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">
            Driver Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage drivers and live vehicle activity
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
        <input
          type="text"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
        />
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

                        <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-5">Add New Driver</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Driver Name"
                value={newDriver.name}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newDriver.email}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={newDriver.phone}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="vehicle_number"
                placeholder="Vehicle Number"
                value={newDriver.vehicle_number}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="vehicle_type"
                placeholder="Vehicle Type"
                value={newDriver.vehicle_type}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="current_location"
                placeholder="Location"
                value={newDriver.current_location}
                onChange={handleAddChange}
                className="border p-3 rounded-lg"
              />

              <select
                name="status"
                value={newDriver.status}
                onChange={handleAddChange}
                className="border p-3 rounded-lg col-span-2"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={addDriver}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DRIVER */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-5">Edit Driver</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={selectedDriver.name}
                onChange={handleEditChange}
                placeholder="Driver Name"
                className="border p-3 rounded-lg"
              />

              <input
                type="email"
                name="email"
                value={selectedDriver.email}
                onChange={handleEditChange}
                placeholder="Email"
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="phone"
                value={selectedDriver.phone}
                onChange={handleEditChange}
                placeholder="Phone"
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="vehicle_number"
                value={selectedDriver.vehicle_number}
                onChange={handleEditChange}
                placeholder="Vehicle Number"
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="vehicle_type"
                value={selectedDriver.vehicle_type}
                onChange={handleEditChange}
                placeholder="Vehicle Type"
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                name="current_location"
                value={selectedDriver.current_location}
                onChange={handleEditChange}
                placeholder="Location"
                className="border p-3 rounded-lg"
              />

              <select
                name="status"
                value={selectedDriver.status}
                onChange={handleEditChange}
                className="border p-3 rounded-lg col-span-2"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={updateDriver}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
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
