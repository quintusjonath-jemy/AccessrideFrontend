import { useState } from "react";
import {
  FaWheelchairMove,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaMicrophone,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerUser = () => {
    if (
      !fullname ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    alert("Registration Successful!");

    setFullname("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleVoiceRegister = () => {
    alert("Voice Registration Activated");
  };

  return (
    <div className="bg-linear-to-br from-blue-100 to-gray-200 min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <FaWheelchairMove className="text-white text-4xl" />
            </div>

            <h1 className="text-4xl font-bold text-blue-900 mt-5">
              Create Account
            </h1>

            <p className="text-gray-500 mt-2 text-lg">
              Join AccessRide Today
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-blue-900 font-semibold mb-2">
              Full Name
            </label>

            <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
              <FaUser className="text-gray-400" />

              <input
                type="text"
                placeholder="Enter your full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full ml-3 outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-blue-900 font-semibold mb-2">
              Email Address
            </label>

            <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
              <FaEnvelope className="text-gray-400" />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full ml-3 outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-blue-900 font-semibold mb-2">
              Phone Number
            </label>

            <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
              <FaPhone className="text-gray-400" />

              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full ml-3 outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-blue-900 font-semibold mb-2">
              Password
            </label>

            <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
              <FaLock className="text-gray-400" />

              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ml-3 outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-blue-900 font-semibold mb-2">
              Confirm Password
            </label>

            <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
              <FaLock className="text-gray-400" />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full ml-3 outline-none"
              />
            </div>
          </div>

          <button
            onClick={registerUser}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-2xl text-xl font-bold shadow-lg transition duration-300"
          >
            Create Account
          </button>

          <div className="text-center mt-10">
            <button
              onClick={handleVoiceRegister}
              className="w-24 h-24 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-lg text-4xl text-yellow-900 transition duration-300 hover:scale-105"
            >
              <FaMicrophone className="mx-auto" />
            </button>

            <p className="text-blue-900 font-semibold text-xl mt-4">
              Use Voice to Registration
            </p>
          </div>

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-300"></div>

            <span className="px-4 text-gray-400 text-sm">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="text-center text-gray-500">
            Already have an account?{" "}
            <Link
            to="/login"
              className="text-blue-900 font-bold hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;