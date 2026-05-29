import axios from "axios";

import { useEffect, useState } from "react";

import { Car, Eye, Trash2, UserPlus } from "lucide-react";

function Drivers() {
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);

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

    offline: "bg-gray-100 text-gray-700",

    busy: "bg-yellow-100 text-yellow-700",
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

        <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl font-semibold transition">
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-5">
        <input
          type="text"
          placeholder="Search drivers..."
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
              drivers.map((driver) => {
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
                        <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Eye className="w-4 h-4" />
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
    </div>
  );
}

export default Drivers;
