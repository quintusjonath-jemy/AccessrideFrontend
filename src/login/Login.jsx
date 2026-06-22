import React, { useState } from "react";
import {
  Mail,
  Lock,
  Mic,
  Shield,
  Headphones,
  Accessibility,
} from "lucide-react";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userError, setUserError] = useState("");

  const loginUser = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const backendBase =  "http://localhost/AccessRide/AccessrideBackend/login";

    try {
      const response = await fetch(`${backendBase}/api/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setUserError(result.error || "Login failed");
        return;
      }

      setUserError("");
      alert(result.message || "Login Successful!");
      setEmail("");
      setPassword("");
    } catch (error) {
      setUserError("Unable to connect to server. Please try again.");
    }
  };

  const voiceLogin = () => {
    alert("Voice Login Activated");
  };

  return (
    <div className="bg-linear-to-br from-blue-100 to-gray-200 min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* USER LOGIN */}
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Accessibility size={40} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-blue-900 mt-5">
                  AccessRide
                </h1>

                <p className="text-gray-500 mt-2 text-lg">
                  Smart Mobility for Everyone
                </p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-blue-900 font-semibold mb-2">
                  Email Address
                </label>

                <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
                  <Mail className="text-gray-400" size={20} />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full ml-3 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-blue-900 font-semibold mb-2">
                  Password
                </label>

                <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
                  <Lock className="text-gray-400" size={20} />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full ml-3 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-right mb-6">
                <a
                  href="#"
                  className="text-blue-900 font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                onClick={loginUser}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-2xl text-xl font-bold shadow-lg"
              >
                Login
              </button>

              {userError && <p className="text-red-500 mt-2">{userError}</p>}

              {/* Voice Login */}
              <div className="text-center mt-10">
                <button
                  onClick={voiceLogin}
                  className="w-24 h-24 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-lg text-yellow-900 flex items-center justify-center mx-auto"
                >
                  <Mic size={40} />
                </button>

                <p className="text-blue-900 font-semibold text-xl mt-4">
                  Use Voice Login
                </p>
              </div>

              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="text-center text-gray-500">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="text-blue-900 font-bold hover:underline"
                >
                  Create Account
                </a>
              </div>
            </>

        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="text-blue-900" />
            </div>

            <div>
              <h3 className="font-bold text-gray-700">Secure</h3>
              <p className="text-gray-500 text-sm">Protected Login</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Headphones className="text-blue-900" />
            </div>

            <div>
              <h3 className="font-bold text-gray-700">24/7</h3>
              <p className="text-gray-500 text-sm">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
