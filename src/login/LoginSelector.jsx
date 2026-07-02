import React from "react";
import { Link } from "react-router-dom";
import { Accessibility, Car, Shield } from "lucide-react";

const LoginSelector = () => {
  return (
    <div className="bg-linear-to-br from-blue-100 to-gray-200 min-h-screen flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-4xl text-center px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg mb-5 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Accessibility size={40} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
            AccessRide
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto">
            Smart Mobility for Everyone
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {/* Rider Portal Card */}
          <Link
            to="/login"
            className="group bg-white border border-slate-100 hover:border-blue-900 rounded-3xl p-8 flex flex-col items-center shadow-2xl hover:scale-[1.03] transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Accessibility size={32} />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Rider Portal</h3>
            <p className="text-gray-500 text-sm text-center">
              Request rides, track travel schedules, and manage your trips.
            </p>
          </Link>

          {/* Driver Portal Card */}
          <Link
            to="/driver-login"
            className="group bg-white border border-slate-100 hover:border-blue-900 rounded-3xl p-8 flex flex-col items-center shadow-2xl hover:scale-[1.03] transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Car size={32} />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Driver Portal</h3>
            <p className="text-gray-500 text-sm text-center">
              Manage routes, track earnings, and view ride requests.
            </p>
          </Link>

          {/* Admin Dashboard Card */}
          <Link
            to="/admin-login"
            className="group bg-white border border-slate-100 hover:border-blue-900 rounded-3xl p-8 flex flex-col items-center shadow-2xl hover:scale-[1.03] transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Admin Panel</h3>
            <p className="text-gray-500 text-sm text-center">
              Monitor active rides, manage drivers, users, and settings.
            </p>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-400 text-xs">
          AccessRide protected login environment. All actions are audited.
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;
