import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    id: 1,
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (security.new_password !== security.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    if (security.new_password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    const formData = new FormData();

    formData.append("id", 1);

    formData.append("current_password", security.current_password);

    formData.append("new_password", security.new_password);

    const res = await axios.post(
      "http://localhost/admin/api/admin.php?action=security",
      formData,
    );

    if (res.data.success) {
      alert("Password updated successfully");
    } else {
      alert("Current password is incorrect");
    }
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

      <div className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">Current Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="current_password"
              value={security.current_password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 pr-16"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-medium"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">New Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="new_password"
              value={security.new_password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 pr-16"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-medium"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Confirm Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              value={security.confirm_password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 pr-16"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-sm font-medium"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
