import React from "react";
import { Link } from "react-router-dom";
import { Accessibility, Car, Shield, ArrowRight } from "lucide-react";

const LoginSelector = () => {
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans flex flex-col justify-between selection:bg-[#FEC329] selection:text-[#0B2F89] relative overflow-hidden">
      {/* Background Soft Glows (CSS only) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Brand */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#0B2F89] rounded-xl flex items-center justify-center shadow-md" role="img" aria-label="AccessRide Logo">
            <Accessibility size={22} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight" aria-label="AccessRide brand name">
            <span className="text-[#FEC329]">Access</span>
            <span className="text-[#0B2F89]">Ride</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-extrabold text-[#0B2F89]">
          <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> 
            Sri Lanka Region
          </span>
        </div>
      </header>

      {/* Hero / Portal Selection */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center relative z-20">
        <div className="text-center max-w-2xl mb-14 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-100 text-[#0B2F89] text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
            ✨ Smart Accessible Mobility Platform
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Seamless Transportation <br className="hidden sm:block" />
            Designed For <span className="text-[#0B2F89]">Everyone</span>
          </h1>
          <p className="text-slate-655 text-base md:text-lg max-w-lg mx-auto font-bold leading-relaxed">
            Welcome to AccessRide. Please select your user portal below to enter and access your account.
          </p>
        </div>

        {/* Options Grid */}
        <nav className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl" aria-label="Portal Selection Links">
          {/* Rider Portal */}
          <Link
            to="/login"
            className="group relative bg-white border border-slate-100 hover:border-[#0B2F89]/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 min-h-[320px] z-20 outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2"
            aria-label="Rider Portal. Click here to sign in as a passenger, request accessible rides, view live route tracking, or manage your trip schedules."
          >
            <div>
              <div className="w-14 h-14 bg-[#0B2F89] text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-900/20 group-hover:rotate-6 transition-transform duration-300">
                <Accessibility size={28} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B2F89] mb-2">Rider Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Request dynamic rides, monitor real-time GPS tracking, share secure trip OTPs, and schedule vehicles suited to your mobility needs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all duration-300">
              <span>Enter Rider Portal</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Driver Portal */}
          <Link
            to="/driver-login"
            className="group relative bg-white border border-slate-100 hover:border-[#FEC329]/70 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 min-h-[320px] z-20 outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2"
            aria-label="Driver Portal. Click here to sign in as a driver, view passenger booking requests, confirm security OTPs, and monitor earnings."
          >
            <div>
              <div className="w-14 h-14 bg-[#FEC329] text-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform duration-300">
                <Car size={28} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Driver Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Accept incoming requests, verify security OTPs, track monthly earnings, and manage your vehicle availability status.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all duration-300">
              <span>Enter Driver Portal</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Admin Panel */}
          <Link
            to="/admin-login"
            className="group relative bg-white border border-slate-100 hover:border-slate-350 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 min-h-[320px] z-20 outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2"
            aria-label="Admin Panel. Click here to sign in as an administrator to monitor live routes, manage profiles, and review system settings."
          >
            <div>
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform duration-300">
                <Shield size={28} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Admin Panel</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Monitor live travel routes, resolve emergency SOS triggers, update driver verification status, and inspect logs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all duration-300">
              <span>Enter Admin Panel</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </nav>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-450 relative z-20">
        <div className="bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
          © {new Date().getFullYear()} AccessRide Mobility. All rights reserved.
        </div>
        <div className="flex gap-6 font-semibold bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
          <span className="text-slate-555 hover:text-[#0B2F89] transition cursor-pointer">Security & Audit</span>
          <span className="text-slate-555 hover:text-[#0B2F89] transition cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginSelector;
