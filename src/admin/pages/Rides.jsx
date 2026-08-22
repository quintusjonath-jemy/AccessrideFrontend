import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Car, Trash2, Plus, Pencil } from "lucide-react";
import API_BASE from "../../config/api";

const Rides = () => {
  const location = useLocation();
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(location.state?.searchQuery || "");

  const [users, setUsers] = useState([]);

  const [drivers, setDrivers] = useState([]);

  const [searchType, setSearchType] = useState(location.state?.searchType || "pickup");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);

  const [rideForm, setRideForm] = useState({
    driver_id: "",
    user_id: "",
    pickup_location: "",
    dropoff_location: "",
    status: "pending",
    fare: "",
    distance_km: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedRide, setSelectedRide] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.searchQuery !== undefined) {
      setSearch(location.state.searchQuery);
    }
    if (location.state?.searchType !== undefined) {
      setSearchType(location.state.searchType);
    }
  }, [location.state]);

  // FETCH RIDES
  useEffect(() => {
    axios.get(`${API_BASE}/admin/api/rides.php`).then((res) => {
      setRides(Array.isArray(res.data) ? res.data : []);

      setLoading(false);
    });

    axios.get(`${API_BASE}/admin/api/users.php`).then((res) => {
      setUsers(res.data);
    });

    axios.get(`${API_BASE}/admin/api/drivers.php`).then((res) => {
      setDrivers(res.data);
    });
  }, []);

  // STATUS COLORS
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",

    active: "bg-green-100 text-green-700",

    completed: "bg-blue-100 text-blue-700",

    cancelled: "bg-red-100 text-red-700",
  };

  const addRide = async () => {
    if (!rideForm.user_id || !rideForm.driver_id) {
      alert("Please select a user and driver");

      return;
    }

    try {
      await axios.post(`${API_BASE}/admin/api/rides.php`, rideForm);

      const res = await axios.get(`${API_BASE}/admin/api/rides.php`);

      setRides(res.data);

      setShowAddModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const updateRide = async () => {
    try {
      await axios.put(`${API_BASE}/admin/api/rides.php`, selectedRide);

      const res = await axios.get(`${API_BASE}/admin/api/rides.php`);

      setRides(res.data);

      setShowEditModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRide = async (id) => {
    if (!window.confirm("Delete this ride?")) return;

    await axios.delete(`${API_BASE}/admin/api/rides.php?id=${id}`);

    setRides(rides.filter((ride) => ride.id !== id));
  };

  const filteredRides = rides.filter((ride) => {
    const matchesStatus =
      filterStatus === "all" ||
      ride.status?.toLowerCase() === filterStatus.toLowerCase();

    if (!matchesStatus) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();

    if (searchType === "pickup") {
      return ride.pickup_location?.toLowerCase().includes(searchLower);
    }
    if (searchType === "destination") {
      return ride.dropoff_location?.toLowerCase().includes(searchLower);
    }
    if (searchType === "user") {
      return ride.user_name?.toLowerCase().includes(searchLower);
    }
    if (searchType === "driver") {
      return ride.driver_name?.toLowerCase().includes(searchLower);
    }
    if (searchType === "id") {
      return String(ride.id).includes(searchLower);
    }
    if (searchType === "status") {
      return ride.status?.toLowerCase().includes(searchLower);
    }

    return true;
  }).sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Rides Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Manage active and completed rides
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" />
          Add Ride
        </button>
      </div>

      {/* Search */}

      <div className="bg-white/90 dark:bg-slate-800 backdrop-blur-md p-5 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            Search & Filter Rides
          </h3>
          <span className="text-xs text-gray-400 dark:text-slate-450">
            Filter by pickup or destination
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* SELECT */}
          <div className="relative w-full md:w-56">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm font-medium text-gray-700 dark:text-slate-200 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            >
              <option value="pickup" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                📍 Pickup Location
              </option>

              <option value="destination" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                🏁 Destination Location
              </option>

              <option value="user" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                👤 Customer Name
              </option>

              <option value="driver" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                🚗 Driver Name
              </option>

              <option value="id" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                🔢 Ride ID
              </option>

              <option value="status" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                ⚙️ Status
              </option>
            </select>

            {/* CUSTOM ARROW */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </div>
          </div>

          {/* STATUS FILTER */}
          <div className="relative w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm font-medium text-gray-700 dark:text-slate-200 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition cursor-pointer"
            >
              <option value="all" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                ⚙️ All Statuses
              </option>
              <option value="pending" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                ⏳ Pending
              </option>
              <option value="accepted" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                ✅ Accepted
              </option>
              <option value="active" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                🚖 Active
              </option>
              <option value="completed" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                🏁 Completed
              </option>
              <option value="cancelled" className="text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                ❌ Cancelled
              </option>
            </select>

            {/* CUSTOM ARROW */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </div>
          </div>

          {/* INPUT */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rides..."
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-750 dark:text-slate-100 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
            />

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* RIDES TABLE */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900/40">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Ride
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Driver
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Location
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Fare
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Distance
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Ride Date
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-400 dark:text-slate-500">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading rides...
                  </div>
                </td>
              </tr>
            ) : (
              filteredRides.map((ride) => {
                const rideStatus = (ride.status || "").toLowerCase().trim();

                return (
                  <tr
                    key={ride.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* RIDE */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center">
                          <Car className="w-5 h-5 text-yellow-600 dark:text-yellow-450" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-100">
                            Ride #{ride.id}
                          </p>

                          <p className="text-sm text-gray-400 dark:text-slate-450">
                            User: {ride.user_name || "Unknown User"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DRIVER */}

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-350">
                      {ride.driver_name || "Unknown Driver"}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[rideStatus] ||
                          "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                          }`}
                      >
                        {ride.status}
                      </span>
                    </td>

                    {/* LOCATION */}

                    <td className="px-6 py-4 text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-450">
                          📍 {ride.pickup_location}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
                          🏁 {ride.dropoff_location}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-slate-200 font-medium">
                      Rs. {ride.fare}
                    </td>

                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      {ride.distance_km} km
                    </td>

                    <td className="px-6 py-4 text-gray-500 dark:text-slate-450">
                      {ride.ride_date}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate("/admin/navigation", {
                              state: {
                                rideId: ride.id,
                                driverId: ride.driver_id,
                              },
                            })
                          }
                          className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Track
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRide({
                              ...ride,
                            });

                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-450 dark:hover:bg-yellow-900/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteRide(ride.id)}
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

      {/* Add rides */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Add Ride</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Create a new ride booking</p>
            </div>

            {/* FORM */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* USER */}
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                value={rideForm.user_id}
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    user_id: e.target.value,
                  })
                }
              >
                <option value="" className="dark:bg-slate-900">👤 Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="dark:bg-slate-900">
                    👤 {user.name}
                  </option>
                ))}
              </select>

              {/* DRIVER */}
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                value={rideForm.driver_id}
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    driver_id: e.target.value,
                  })
                }
              >
                <option value="" className="dark:bg-slate-900">🚗 Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id} className="dark:bg-slate-900">
                    🚗 {driver.name}
                  </option>
                ))}
              </select>

              {/* PICKUP */}
              <input
                placeholder="📍 Pickup Location"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    pickup_location: e.target.value,
                  })
                }
              />

              {/* DROPOFF */}
              <input
                placeholder="🏁 Destination"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    dropoff_location: e.target.value,
                  })
                }
              />

              {/* DISTANCE */}
              <input
                type="number"
                placeholder="📏 Distance (KM)"
                value={rideForm.distance_km}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                onChange={(e) => {
                  const distance = e.target.value;

                  setRideForm({
                    ...rideForm,
                    distance_km: distance,
                    fare: distance
                      ? (parseFloat(distance) * 80).toFixed(2)
                      : "",
                  });
                }}
              />

              {/* FARE */}
              <div className="w-full px-4 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/40 text-yellow-700 dark:text-yellow-400 font-semibold text-sm">
                💰 Fare: Rs. {rideForm.fare || 0}
              </div>

              {/* STATUS */}
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-500/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="pending" className="dark:bg-slate-900">⏳ Pending</option>
                <option value="accepted" className="dark:bg-slate-900">✅ Accepted</option>
                <option value="active" className="dark:bg-slate-900">🚖 Active</option>
                <option value="completed" className="dark:bg-slate-900">🏁 Completed</option>
                <option value="cancelled" className="dark:bg-slate-900">❌ Cancelled</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-slate-750 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={addRide}
                className="px-5 py-2 rounded-xl bg-yellow-500 dark:bg-yellow-600 text-white font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-500 transition shadow-sm"
              >
                Save Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit rides */}

      {showEditModal && selectedRide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Edit Ride</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Update ride details</p>
            </div>

            {/* FORM */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* USER */}
              <select
                value={selectedRide.user_id}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    user_id: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="dark:bg-slate-900">
                    👤 {user.name}
                  </option>
                ))}
              </select>

              {/* DRIVER */}
              <select
                value={selectedRide.driver_id}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    driver_id: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              >
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id} className="dark:bg-slate-900">
                    🚗 {driver.name}
                  </option>
                ))}
              </select>

              {/* PICKUP */}
              <input
                value={selectedRide.pickup_location}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    pickup_location: e.target.value,
                  })
                }
                placeholder="📍 Pickup Location"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              />

              {/* DROPOFF */}
              <input
                value={selectedRide.dropoff_location}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    dropoff_location: e.target.value,
                  })
                }
                placeholder="🏁 Destination"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              />

              {/* DISTANCE */}
              <input
                type="number"
                value={selectedRide.distance_km}
                onChange={(e) => {
                  const distance = e.target.value;

                  setSelectedRide({
                    ...selectedRide,
                    distance_km: distance,
                    fare: (parseFloat(distance || 0) * 80).toFixed(2),
                  });
                }}
                placeholder="📏 Distance (KM)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              />

              {/* FARE */}
              <div className="w-full px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                💰 Fare: Rs. {selectedRide.fare || 0}
              </div>

              {/* STATUS */}
              <select
                value={selectedRide.status}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    status: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-800 dark:text-slate-100 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition"
              >
                <option value="pending" className="dark:bg-slate-900">⏳ Pending</option>
                <option value="accepted" className="dark:bg-slate-900">✅ Accepted</option>
                <option value="active" className="dark:bg-slate-900">🚖 Active</option>
                <option value="completed" className="dark:bg-slate-900">🏁 Completed</option>
                <option value="cancelled" className="dark:bg-slate-900">❌ Cancelled</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-slate-750 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={updateRide}
                className="px-5 py-2 rounded-xl bg-blue-600 dark:bg-blue-700 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-sm"
              >
                Update Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rides;
