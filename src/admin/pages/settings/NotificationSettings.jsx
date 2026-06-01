const NotificationSettings = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" />
          SOS Alert Notifications
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" />
          Ride Notifications
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" />
          Driver Notifications
        </label>
      </div>
    </div>
  );
}

export default NotificationSettings;
