import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Car, Trash2, Plus, Pencil } from "lucide-react";

const Rides = () => {
  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);

  const [drivers, setDrivers] = useState([]);

  const [searchType, setSearchType] = useState("pickup");

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

  // FETCH RIDES
  useEffect(() => {
    axios.get("http://localhost/admin/api/rides.php").then((res) => {
      setRides(Array.isArray(res.data) ? res.data : []);

      setLoading(false);
    });

    axios.get("http://localhost/admin/api/users.php").then((res) => {
      setUsers(res.data);
    });

    axios.get("http://localhost/admin/api/drivers.php").then((res) => {
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
      await axios.post("http://localhost/admin/api/rides.php", rideForm);

      const res = await axios.get("http://localhost/admin/api/rides.php");

      setRides(res.data);

      setShowAddModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const updateRide = async () => {
    try {
      await axios.put("http://localhost/admin/api/rides.php", selectedRide);

      const res = await axios.get("http://localhost/admin/api/rides.php");

      setRides(res.data);

      setShowEditModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRide = async (id) => {
    if (!window.confirm("Delete this ride?")) return;

    await axios.delete(`http://localhost/admin/api/rides.php?id=${id}`);

    setRides(rides.filter((ride) => ride.id !== id));
  };

  const filteredRides = rides.filter((ride) => {
    if (!search) return true;

    if (searchType === "pickup") {
      return ride.pickup_location?.toLowerCase().includes(search.toLowerCase());
    }

    return ride.dropoff_location?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">Ride Management</h1>

          <p className="text-gray-500 mt-1">
            Manage active and completed rides
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Add Ride
        </button>
      </div>

      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
        <div className="flex gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="pickup">Location Wise</option>

            <option value="destination">Destination Wise</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rides..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* RIDES TABLE */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Ride
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Driver
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Location
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Fare
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Distance
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Ride Date
              </th>

              <th className="text-right px-6 py-4 text-sm text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
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
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* RIDE */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Car className="w-5 h-5 text-yellow-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            Ride #{ride.id}
                          </p>

                          <p className="text-sm text-gray-400">
                            User: {ride.user_name || "Unknown User"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DRIVER */}

                    <td className="px-6 py-4 text-gray-600">
                      {ride.driver_name || "Unknown Driver"}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[rideStatus] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>

                    {/* LOCATION */}

                    <td className="px-6 py-4 text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          📍 {ride.pickup_location}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-red-500">
                          🏁 {ride.dropoff_location}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600 font-medium">
                      Rs. {ride.fare}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {ride.distance_km} km
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {ride.ride_date}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate("/navigation", {
                              state: {
                                rideId: ride.id,
                                driverId: ride.driver_id,
                              },
                            })
                          }
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm transition"
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
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteRide(ride.id)}
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

       {/* Add rides */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[500px]">
            <h2 className="text-xl font-bold mb-5">Add Ride</h2>

            <div className="space-y-3">
              <select
                className=" w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                value={rideForm.user_id}
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    user_id: e.target.value,
                  })
                }
              >
                <option value="">Select User</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <select
                className=" w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                value={rideForm.driver_id}
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    driver_id: e.target.value,
                  })
                }
              >
                <option value="">Select Driver</option>

                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Pickup Location"
                className=" w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    pickup_location: e.target.value,
                  })
                }
              />

              <input
                placeholder="Destination"
                className=" w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    dropoff_location: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Distance KM"
                value={rideForm.distance_km}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
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

              <input
                type="text"
                value={`Rs. ${rideForm.fare || 0}`}
                className=" w-full border p-3 rounded-lg bg-gray-100 text-gray-700 font-semibold"
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

              <select
                className=" w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                onChange={(e) =>
                  setRideForm({
                    ...rideForm,
                    status: e.target.value,
                  })
                }
              >
                <option value="pending">Pending</option>

                <option value="accepted">Accepted</option>

                <option value="active">Active</option>

                <option value="completed">Completed</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={addRide}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
              >
                Save Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit rides */}

      {showEditModal && selectedRide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[550px]">
            <h2 className="text-xl font-bold mb-5">Edit Ride</h2>

            <div className="space-y-3">
              {/* User */}

              <select
                value={selectedRide.user_id}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    user_id: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              {/* Driver */}

              <select
                value={selectedRide.driver_id}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    driver_id: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              >
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              {/* Pickup */}

              <input
                value={selectedRide.pickup_location}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    pickup_location: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              {/* Destination */}

              <input
                value={selectedRide.dropoff_location}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    dropoff_location: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              {/* Distance */}

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
                className="w-full border p-3 rounded-lg"
              />

              {/* Fare */}

              <input
                value={`Rs. ${selectedRide.fare}`}
                readOnly
                className="w-full border p-3 rounded-lg bg-gray-100"
              />

              {/* Status */}

              <select
                value={selectedRide.status}
                onChange={(e) =>
                  setSelectedRide({
                    ...selectedRide,
                    status: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={updateRide}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
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
