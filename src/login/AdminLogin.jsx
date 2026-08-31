import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, CarTaxiFront } from "lucide-react";
import API_BASE from "../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/login/api/admin_login.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError("Username or password is invalid");
        return;
      }

      setError("");

      // Store admin details strictly in sessionStorage (auto-clears on browser/tab close)
      localStorage.removeItem("admin_id");
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_name");
      sessionStorage.setItem("admin_id", result.admin.id);
      sessionStorage.setItem("admin_email", result.admin.email);
      sessionStorage.setItem("admin_name", result.admin.name);

      setEmail("");
      setPassword("");
      setRemember(false);
      navigate("/admin");
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 to-gray-200 flex items-center justify-center px-4 py-6">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-900 rounded-3xl flex items-center justify-center shadow-lg">
              <CarTaxiFront className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <h1 className="text-blue-900 text-xl sm:text-2xl font-bold">
                AccessRide Admin
              </h1>

              <p className="text-gray-500 text-xs sm:text-sm">
                Sign in to manage drivers, rides, and settings
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-blue-900 text-sm font-medium">
                Email
              </label>

              <div className="mt-2 relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@accessride.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 text-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-blue-900 text-sm font-medium">
                Password
              </label>

              <div className="mt-2 relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 text-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
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
              className="w-full py-2.5 sm:py-3 bg-blue-900 hover:bg-blue-800 hover:scale-105 transition-all duration-300 text-white rounded-lg font-semibold shadow"
            >
              Sign In
            </button>

            {error && (
              <p className="text-red-500 text-sm font-semibold mt-3 text-center">{error}</p>
            )}

          </form>

          {/* Footer */}
          <p className="text-gray-500 text-[11px] sm:text-xs mt-6 text-center">
            By signing in you agree to AccessRide admin terms.
          </p>
          <div className="text-center mt-5 border-t pt-4">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700 font-semibold hover:underline text-sm"
            >
              ← Back to Selector
            </a>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminLogin;