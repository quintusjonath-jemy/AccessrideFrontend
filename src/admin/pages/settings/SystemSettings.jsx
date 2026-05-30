function SystemSettings() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Company Name"
          className="w-full border p-3 rounded-lg"
        />

        <select className="w-full border p-3 rounded-lg">
          <option>Light Mode</option>

          <option>Dark Mode</option>
        </select>
      </div>
    </div>
  );
}

export default SystemSettings;
