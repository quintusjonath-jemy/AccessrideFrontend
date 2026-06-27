import React, { useState } from "react";
import { Mail, Lock, CarTaxiFront } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost/AccessRide/AccessrideBackend/login/api/admin_login.php",
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
        alert(result.error);
        return;
      }

      alert(result.message);

    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 to-gray-200 flex items-center justify-center p-5">
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-900 rounded-3xl flex items-center justify-center shadow-lg">
              <CarTaxiFront className="text-white" size={28} />
            </div>

            <div>
              <h1 className="text-blue-900 text-2xl font-bold">
                AccessRide Admin
              </h1>

              <p className="text-gray-500 text-sm">
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
                  placeholder="admin@accessride.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm text-gray-600">
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
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold shadow"
            >
              Sign In
            </button>

          </form>

          {/* Footer */}
          <p className="text-gray-500 text-xs mt-6">
            By signing in you agree to AccessRide admin terms.
          </p>

        </div>
      </main>
    </div>
  );
};

export default AdminLogin;