import React, { useState } from "react";
import axios from "axios";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  KeyRound,
} from "lucide-react";

const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    id: 1,
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value,
    });
  };

  const passwordStrength = () => {
    if (security.new_password.length < 6)
      return {
        text: "Weak",
        color: "bg-red-500",
      };

    if (security.new_password.length < 10)
      return {
        text: "Medium",
        color: "bg-yellow-500",
      };

    return {
      text: "Strong",
      color: "bg-green-500",
    };
  };

  const handleSave = async () => {
    if (
      security.new_password !==
      security.confirm_password
    ) {
      setMessage("Passwords do not match");
      return;
    }

    const formData = new FormData();

    formData.append("id", 1);
    formData.append(
      "current_password",
      security.current_password
    );
    formData.append(
      "new_password",
      security.new_password
    );

    try {
      const res = await axios.post(
        "http://localhost/admin/api/admin.php?action=security",
        formData
      );

      if (res.data.success) {
        setMessage(
          "Password updated successfully"
        );

        setSecurity({
          ...security,
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        setMessage(
          "Current password is incorrect"
        );
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  const strength = passwordStrength();

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <ShieldCheck size={40} />

          <div>
            <h1 className="text-2xl font-bold">
              Security Settings
            </h1>

            <p className="text-blue-100">
              Manage your password and account
              security.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        {message && (
          <div className="mb-5 p-3 rounded-lg bg-blue-50 text-blue-700">
            {message}
          </div>
        )}

        <div className="space-y-5">

          {/* Current Password */}

          <div>
            <label className="font-medium flex items-center gap-2 mb-2">
              <Lock size={16} />
              Current Password
            </label>

            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={security.current_password}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 pr-12 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(!showCurrent)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrent ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}

          <div>
            <label className="font-medium flex items-center gap-2 mb-2">
              <KeyRound size={16} />
              New Password
            </label>

            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="new_password"
                value={security.new_password}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 pr-12 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(!showNew)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNew ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {security.new_password && (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full ${strength.color}`}
                    style={{
                      width:
                        strength.text === "Weak"
                          ? "33%"
                          : strength.text === "Medium"
                          ? "66%"
                          : "100%",
                    }}
                  />
                </div>

                <p className="text-sm mt-1 text-gray-600">
                  Password Strength:
                  {" "}
                  {strength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <label className="font-medium mb-2 block">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                name="confirm_password"
                value={security.confirm_password}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 pr-12 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Security Tips */}

      <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl">
        <h3 className="font-semibold text-yellow-700 mb-2">
          Security Recommendations
        </h3>

        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • Use at least 8 characters
          </li>
          <li>
            • Include uppercase and lowercase letters
          </li>
          <li>
            • Include numbers and symbols
          </li>
          <li>
            • Change your password regularly
          </li>
        </ul>
      </div>

    </div>
  );
};

export default SecuritySettings;