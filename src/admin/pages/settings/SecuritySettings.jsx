function SecuritySettings() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

      <div className="space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded-lg"
        />

        <button className="bg-green-600 text-white px-5 py-3 rounded-lg">
          Update Password
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;
