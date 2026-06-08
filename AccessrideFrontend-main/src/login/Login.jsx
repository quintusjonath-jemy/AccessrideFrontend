import React from "react";
import {
  Mail,
  Mic,
  Shield,
  Headphones,
  ArrowRight,
  Accessibility,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#d9dbe3] flex flex-col items-center justify-center px-4 py-6">
      
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-[#002b84] rounded-2xl flex items-center justify-center shadow-lg">
          <Accessibility className="text-white w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-[#002b84] mt-4">
          AccessRide
        </h1>

        <p className="text-gray-600 text-lg">
          Smart Mobility for Everyone
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-6">
        
        {/* Email */}
        <div className="mb-5">
          <label className="block text-[#002b84] font-semibold mb-2">
            Email
          </label>

          <div className="flex items-center border-2 border-[#002b84] rounded-xl px-3 py-3">
            <Mail className="text-gray-500 mr-2" size={20} />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full outline-none text-lg"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-[#002b84] font-semibold mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="••••••••"
            className="w-full border-2 border-gray-400 rounded-xl px-4 py-3 outline-none text-lg"
          />
        </div>

        {/* Forgot Password */}
        <div className="text-right mb-6">
          <button className="text-[#002b84] font-semibold hover:underline">
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button className="w-full bg-[#002b84] hover:bg-[#001f63] text-white text-2xl font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition">
          Login <ArrowRight size={24} />
        </button>

        {/* Voice Login */}
        <div className="flex flex-col items-center mt-10">
          <button className="w-28 h-28 rounded-full bg-yellow-400 border-4 border-[#002b84] flex items-center justify-center shadow-md hover:scale-105 transition">
            <Mic size={42} className="text-[#6b4d00]" />
          </button>

          <p className="text-[#002b84] text-3xl font-bold mt-4">
            Use voice to login
          </p>
        </div>

        {/* Divider */}
        <div className="border-t mt-8 pt-5 text-center">
          <p className="text-gray-600 text-lg">
            Don’t have an account?{" "}
              <Link to="/register"className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded-xl font-bold text-black">
              Sign up
              </Link>
          </p>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
        
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="bg-gray-100 p-3 rounded-full">
            <Shield className="text-[#002b84]" />
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Secure</h3>
            <p className="text-gray-600">Login</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="bg-gray-100 p-3 rounded-full">
            <Headphones className="text-[#002b84]" />
          </div>

          <div>
            <h3 className="font-bold text-gray-700">24/7</h3>
            <p className="text-gray-600">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}