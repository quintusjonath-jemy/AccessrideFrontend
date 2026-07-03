import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Eye, EyeClosed, Pencil, Trash2, UserPlus } from "lucide-react";

const Users = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedUser, setDetailedUser] = useState(null);
  const [fetchingUserId, setFetchingUserId] = useState(null);

  const handleShowUserDetails = async (userId) => {
    setFetchingUserId(userId);
    try {
      const res = await axios.get(`http://localhost/admin/api/users.php?id=${userId}`);
      if (res.data) {
        setDetailedUser(res.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error("Failed to load user details:", err);
      alert("Failed to fetch user details");
    } finally {
      setFetchingUserId(null);
    }
  };
  const [search, setSearch] = useState(location.state?.searchQuery || "");

  useEffect(() => {
    if (location.state?.searchQuery !== undefined) {
      setSearch(location.state.searchQuery);
    }
  }, [location.state]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    status: "active",
    location: "",
  });

  const [selectedUser, setSelectedUser] = useState({
    id: "",
    name: "",
    email: "",
    status: "",
    location: "",
  });

  const uniqueLocations = Array.from(new Set(users.map(u => u.location).filter(Boolean))).sort();

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      (user.phone || "").toLowerCase().includes(searchLower) ||
      (user.location || "").toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all" ||
      user.status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesLocation =
      filterLocation === "all" ||
      user.location === filterLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Fetch users from backend
  useEffect(() => {
    axios
      .get("http://localhost/admin/api/users.php")

      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })

      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // status color
  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-600";

      case "emergency":
        return "bg-red-100 text-red-600";

      case "blocked":
        return "bg-yellow-200 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const addUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost/admin/api/users.php",
        newUser,
      );

      if (res.data.success) {
        const refresh = await axios.get("http://localhost/admin/api/users.php");

        setUsers(refresh.data);

        setShowAddModal(false);

        setNewUser({
          name: "",
          email: "",
          status: "active",
          location: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditChange = (e) => {
    setSelectedUser({
      ...selectedUser,
      [e.target.name]: e.target.value,
    });
  };

  const updateUser = async () => {
    try {
      const res = await axios.put(
        "http://localhost/admin/api/users.php",
        selectedUser,
      );

      if (res.data.success) {
        const refresh = await axios.get("http://localhost/admin/api/users.php");

        setUsers(refresh.data);

        setShowEditModal(false);

        alert("User updated successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost/admin/api/users.php?id=${id}`);

      // Remove deleted user from UI
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleUserStatus = async (user) => {
    const action =
      user.status?.toLowerCase() === "blocked" ? "unblock" : "block";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`,
    );

    if (!confirmAction) return;

    await axios.get(`http://localhost/admin/api/users.php?hide=${user.id}`);

    const refresh = await axios.get("http://localhost/admin/api/users.php");

    setUsers(refresh.data);
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Users Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage blind assistance users</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center transition-colors">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-gray-850 dark:text-slate-100 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-850 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-850 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer max-w-[200px]"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900/40">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Name
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Phone
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                Email
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                status
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
                <td colSpan="6" className="text-center py-10 text-gray-400 dark:text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-850 dark:text-slate-100">
                    <span 
                      className="cursor-pointer hover:text-yellow-600 hover:underline flex items-center gap-2 w-fit"
                      onClick={() => handleShowUserDetails(user.id)}
                    >
                      {user.name}
                      {fetchingUserId === user.id && (
                        <span className="w-3.5 h-3.5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 font-medium">{user.phone || "N/A"}</td>

                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{user.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{user.location}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                          user.status?.toLowerCase() === "blocked"
                            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/40"
                        }`}
                      >
                        {user.status?.toLowerCase() === "blocked" ? (
                          <EyeClosed className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Add New User</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Create a new user account in the system
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Location
                </label>
                <input
                  placeholder="Enter location"
                  value={newUser.location}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      location: e.target.value,
                    })
                  }
                  className="mt-1 w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                />
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
                onClick={addUser}
                className="px-5 py-2.5 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 shadow-md transition font-semibold"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Edit User</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Update user information</p>
            </div>

            {/* FORM */}
            <div className="p-6 space-y-4">
              <input
                type="text"
                name="name"
                value={selectedUser.name}
                onChange={handleEditChange}
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-gray-800 dark:text-slate-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none transition"
              />

              <input
                type="email"
                name="email"
                value={selectedUser.email}
                onChange={handleEditChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-gray-800 dark:text-slate-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none transition"
              />

              <input
                type="text"
                name="location"
                value={selectedUser.location}
                onChange={handleEditChange}
                placeholder="Location"
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-gray-800 dark:text-slate-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none transition"
              />

              <select
                name="status"
                value={selectedUser.status}
                onChange={handleEditChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-gray-800 dark:text-slate-100 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none transition"
              >
                <option value="active">Active</option>
                <option value="emergency">Emergency</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-900">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-slate-750 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                className="px-5 py-2 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {showDetailsModal && detailedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {detailedUser.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  User profile metrics & settings
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(detailedUser.status)}`}>
                {detailedUser.status}
              </span>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Core Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Contact & Location
                </h3>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Email:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-350 truncate">{detailedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Phone:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-350">{detailedUser.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Location:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">📍 {detailedUser.location || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 w-24">Joined:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{detailedUser.created_at || "N/A"}</span>
                  </div>
                </div>

                {/* Emergency Contact */}
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider pt-2">
                  Emergency Guardian
                </h3>
                <div className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-xl space-y-3 border border-red-100/30 dark:border-red-950/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-red-500/70 w-24">Name:</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{detailedUser.contact_name || "None Registered"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-red-500/70 w-24">Phone:</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{detailedUser.contact_phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Usage & Payments */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Usage & Payments
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-sm">
                    <p className="text-xs text-blue-100 font-medium">Completed Rides</p>
                    <p className="text-3xl font-extrabold mt-1">{detailedUser.completed_rides_count || 0}</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl text-white shadow-sm">
                    <p className="text-xs text-yellow-100 font-medium">Total Paid</p>
                    <p className="text-3xl font-extrabold mt-1">${Number(detailedUser.total_amount_paid || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-xl space-y-2 mt-4 text-center">
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Accessibility Status
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-305 leading-relaxed font-medium">
                    This user receives assistance protocols, including automatic SOS alerts and guardian notification alerts during their rides.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={() => {
                  setSelectedUser(detailedUser);
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

export default Users;
