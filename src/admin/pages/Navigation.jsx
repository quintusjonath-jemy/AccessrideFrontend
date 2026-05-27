function Navigation() {
  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Navigation Monitoring
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-5">

        <table className="w-full">

          <thead>
            <tr className="border-b text-left text-gray-500">

              <th className="pb-3">User</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Action</th>

            </tr>
          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-4">John</td>
              <td>Hospital</td>
              <td className="text-green-600">
                Safe
              </td>

              <td>
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Track
                </button>
              </td>
            </tr>

            <tr>
              <td className="py-4">Sarah</td>
              <td>Bus Station</td>
              <td className="text-yellow-500">
                Navigating
              </td>

              <td>
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  View
                </button>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Navigation