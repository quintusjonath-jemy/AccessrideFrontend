import React, { useState } from "react";
import {
  Mail,
  Lock,
  Mic,
  Shield,
  Headphones,
  Accessibility,
  Car,
} from "lucide-react";

const Login = () => {
  const [isDriver, setIsDriver] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [dphone, setDphone] = useState("");
  const [dpassword, setDpassword] = useState("");
  const [otpPhone, setOtpPhone] = useState("");

  const loginUser = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    alert("Login Successful!");
    setEmail("");
    setPassword("");
  };

  const driverLogin = () => {
    if (!dphone || !dpassword) {
      alert("Please enter phone and password");
      return;
    }

    alert(`Driver Login Successful: ${dphone}`);
    setDphone("");
    setDpassword("");
  };

  const sendOtp = () => {
    if (!otpPhone) {
      alert("Enter phone number for OTP");
      return;
    }

    alert(`OTP sent to ${otpPhone}`);
    setOtpPhone("");
  };

  const voiceLogin = () => {
    alert("Voice Login Activated");
  };

  return (
    <div className="bg-linear-to-br from-blue-100 to-gray-200 min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 justify-center">
            <button
              onClick={() => setIsDriver(false)}
              className={`px-4 py-2 rounded-full font-semibold ${
                !isDriver
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-900 border border-gray-200"
              }`}
            >
              Login as User
            </button>

            <button
              onClick={() => setIsDriver(true)}
              className={`px-4 py-2 rounded-full font-semibold ${
                isDriver
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-900 border border-gray-200"
              }`}
            >
              Login as Driver
            </button>
          </div>

          {/* USER LOGIN */}
          {!isDriver && (
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
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-900 font-bold hover:underline"
                >
                  Create Account
                </a>
              </div>
            </>
          )}

          {/* DRIVER LOGIN */}
          {isDriver && (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Car size={35} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-blue-900 mt-4">
                  Driver Login
                </h2>

                <p className="text-gray-500">
                  Sign in to manage your rides and availability
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-blue-900 font-semibold mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={dphone}
                  onChange={(e) => setDphone(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-blue-900 font-semibold mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  value={dpassword}
                  onChange={(e) => setDpassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-blue-900 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                onClick={driverLogin}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-2xl text-xl font-bold"
              >
                Sign In
              </button>

              <div className="text-center text-gray-500 mt-4">
                or sign in with OTP
              </div>

              <div className="flex gap-3 mt-3">
                <input
                  type="tel"
                  placeholder="Phone for OTP"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-lg"
                />

                <button
                  onClick={sendOtp}
                  className="px-4 py-3 border border-blue-900 text-blue-900 rounded-lg"
                >
                  Send OTP
                </button>
              </div>

              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="text-center text-gray-500 text-base">
                Don't have an account?{' '}
                <a
                  href="/register?driver=true"
                  className="text-blue-900 font-bold hover:underline"
                >
                  Create Account
                </a>
              </div>

              <p className="text-gray-500 text-xs mt-5 text-center">
                Drivers must be approved before accessing the dashboard.
              </p>
            </>
          )}
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