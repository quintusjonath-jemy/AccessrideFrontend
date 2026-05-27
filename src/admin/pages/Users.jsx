import axios from "axios";
import { useEffect, useState } from "react";

import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost/api/users.php?id=${id}`);

      // Remove deleted user from UI
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.log(error);
    }
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

        <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold transition">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
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
              users.map((user) => (
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
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <Eye className="w-4 h-4" />
                      </button>

                      <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
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
    </div>
  );
}

export default Users;
