import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Phone, Lock } from "lucide-react";
import API_BASE from "../config/api";

const DriverLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert("Please enter phone and password");
      return;
    }

    const backendBase = `${API_BASE}/login`;

    try {
      const response = await fetch(`${backendBase}/api/driver_login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
          isDriver: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Login failed");
        return;
      }

      setError("");
      alert(result.message || `Driver signed in: ${phone}`);

      if (result.driver && result.driver.id) {
        localStorage.removeItem("driver_id");
        sessionStorage.setItem("driver_id", result.driver.id);
      }

      setPhone("");
      setPassword("");
      setRememberMe(false);
      navigate("/driver-dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
      setError(error.message);
    }
  };

  const sendOtp = () => {
    if (!otpPhone) {
      alert("Enter phone number for OTP");
      return;
    }

    alert(`OTP sent to ${otpPhone} (mock)`);
    setOtpPhone("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <Car size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-extrabold text-blue-900 mt-4">
              Driver Portal
            </h2>

            <p className="text-gray-500 mt-1">
              Sign in to manage your rides and availability
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Phone Number */}
            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Phone Number
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-900">
                <Phone size={18} className="text-gray-400" />

                <input
                  type="tel"
                  placeholder="e.g. +94 123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full ml-3 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-900">
                <Lock size={18} className="text-gray-400" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ml-3 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Remember me
              </label>

              <a
                href="#"
                className="text-blue-900 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold shadow"
            >
              Sign In
            </button>

              {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* OTP Section */}
            <div className="text-center text-sm text-gray-500">
              or sign in with OTP
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="tel"
                placeholder="Phone for OTP"
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />

              <button
                type="button"
                onClick={sendOtp}
                className="px-4 py-3 bg-white border border-blue-900 text-blue-900 rounded-lg font-semibold hover:bg-blue-50"
              >
                Send OTP
              </button>
            </div>

          </form>
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Don’t have an account?{" "}
              <a
                href="/driver-register"
                className="text-blue-900 font-semibold hover:underline"
              >
                Create Account
              </a>
            </p>
            <div className="text-center mt-3 border-t pt-3">
              <a
                href="/"
                className="text-gray-500 hover:text-gray-700 font-semibold hover:underline text-sm"
              >
                ← Back to Selector
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="text-gray-500 text-xs mt-6 text-center">
            Drivers must be approved before accessing the dashboard.
          </p>

        </div>
      </div>
    </div>
  );
};

export default DriverLogin;