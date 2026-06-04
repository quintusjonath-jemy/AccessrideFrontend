import axios from "axios";
import { useEffect, useState } from "react";

import { Eye, EyeClosed, Pencil, Trash2, UserPlus } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

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
    <div>
      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1929]">
            Users Management
          </h1>

          <p className="text-gray-500 mt-1">Manage blind assistance users</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2"
        />
      </div>

      {/* Users Table */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Name
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                Email
              </th>

              <th className="text-left px-6 py-4 text-sm text-gray-500">
                status
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
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium">{user.name}</td>

                  <td className="px-6 py-4 text-gray-500">{user.email}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">{user.location}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                          user.status?.toLowerCase() === "blocked"
                            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                        className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[450px]">
            <h2 className="text-xl font-bold mb-5">Add New User</h2>

            <div className="space-y-4">
              <input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    name: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              <input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    email: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />

              <input
                placeholder="Location"
                value={newUser.location}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    location: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={addUser}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-5">Edit User</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={selectedUser.name}
                onChange={handleEditChange}
                className="w-full border p-3 rounded-lg"
                placeholder="Name"
              />

              <input
                type="email"
                name="email"
                value={selectedUser.email}
                onChange={handleEditChange}
                className="w-full border p-3 rounded-lg"
                placeholder="Email"
              />

              <input
                type="text"
                name="location"
                value={selectedUser.location}
                onChange={handleEditChange}
                className="w-full border p-3 rounded-lg"
                placeholder="Location"
              />

              <select
                name="status"
                value={selectedUser.status}
                onChange={handleEditChange}
                className="w-full border p-3 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="emergency">Emergency</option>
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
                onClick={updateUser}
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

export default Users;
