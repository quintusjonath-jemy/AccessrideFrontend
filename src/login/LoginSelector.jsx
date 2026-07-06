import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Accessibility, Car, Shield, ArrowRight } from "lucide-react";

const LoginSelector = () => {
  // Track which card is hovered to trigger custom background videos, animations, and tints
  const [hoveredPortal, setHoveredPortal] = useState(null);

  // Track dynamic 3D tilt transformation matrix for each card
  const [tiltStyles, setTiltStyles] = useState({
    rider: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    driver: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    admin: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
  });

  // Calculate 3D rotation based on mouse coordinates relative to the card
  const handleMouseMove = (e, cardType) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // cursor x inside card
    const y = e.clientY - rect.top;  // cursor y inside card
    
    const width = rect.width;
    const height = rect.height;
    
    // Convert coordinate to range [-1, 1]
    const xVal = (x - width / 2) / (width / 2);
    const yVal = (y - height / 2) / (height / 2);
    
    // Rotate up to 12 degrees
    const rotateY = xVal * 12;
    const rotateX = -yVal * 12;
    
    setTiltStyles((prev) => ({
      ...prev,
      [cardType]: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
    }));
  };

  // Reset 3D transformation when cursor leaves the card
  const handleMouseLeave = (cardType) => {
    setTiltStyles((prev) => ({
      ...prev,
      [cardType]: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    }));
    setHoveredPortal(null);
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans flex flex-col justify-between selection:bg-[#FEC329] selection:text-[#0B2F89] relative overflow-hidden">
      
      {/* Background Video Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Default cover time-lapse video (faded out when any portal is hovered) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover scale-[1.05] filter brightness-[0.95] transition-opacity duration-700 ${
            hoveredPortal !== null ? "opacity-0" : "opacity-100"
          }`}
          src="https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-time-lapse-1279-large.mp4"
        />

        {/* Passenger YouTube Background Video (visible on Rider hover) */}
        {hoveredPortal === "rider" && (
          <iframe
            className="absolute inset-0 w-full h-full scale-[1.45] origin-center filter brightness-[0.85] contrast-[1.05]"
            src="https://www.youtube.com/embed/60xOF7m2H18?autoplay=1&mute=1&controls=0&loop=1&playlist=60xOF7m2H18&vq=hd720&playsinline=1&showinfo=0&rel=0&iv_load_policy=3"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="passenger-video"
          />
        )}

        {/* Driver YouTube Background Video (visible on Driver hover) */}
        {hoveredPortal === "driver" && (
          <iframe
            className="absolute inset-0 w-full h-full scale-[1.45] origin-center filter brightness-[0.85] contrast-[1.05]"
            src="https://www.youtube.com/embed/PrRruj9UXuY?autoplay=1&mute=1&controls=0&loop=1&playlist=PrRruj9UXuY&vq=hd720&playsinline=1&showinfo=0&rel=0&iv_load_policy=3"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="driver-video"
          />
        )}

        {/* Admin YouTube Background Video (visible on Admin hover) */}
        {hoveredPortal === "admin" && (
          <iframe
            className="absolute inset-0 w-full h-full scale-[1.35] origin-center filter brightness-[0.85] contrast-[1.05]"
            src="https://www.youtube.com/embed/yRPTQTlafxw?autoplay=1&mute=1&controls=0&loop=1&playlist=yRPTQTlafxw&vq=hd720&playsinline=1&showinfo=0&rel=0&iv_load_policy=3"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="admin-video"
          />
        )}

        {/* Glassmorphic dynamic overlay to ensure text readability */}
        <div 
          className={`absolute inset-0 transition-colors duration-700 backdrop-blur-xs ${
            hoveredPortal === "rider" ? "bg-blue-50/70" :
            hoveredPortal === "driver" ? "bg-amber-50/75" :
            hoveredPortal === "admin" ? "bg-slate-100/70" :
            "bg-slate-50/80"
          }`}
        />
      </div>

      {/* Dynamic Floating Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700 z-10">
        {/* Rider Selected: ripples */}
        {hoveredPortal === "rider" && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="absolute w-75 h-75 border-2 border-blue-200/40 rounded-full animate-ping" />
            <div className="absolute w-125 h-125 border border-blue-200/20 rounded-full animate-[ping_2.5s_infinite]" />
          </div>
        )}

        {/* Driver Selected: sweeps */}
        {hoveredPortal === "driver" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-112.5 h-112.5 bg-linear-to-tr from-amber-200/10 to-transparent rounded-full animate-spin duration-[10s]" />
          </div>
        )}

        {/* Admin Selected: control grid */}
        {hoveredPortal === "admin" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-size-[28px_28px] opacity-40 animate-pulse" />
            <div className="absolute w-125 h-125 border border-dashed border-slate-300/40 rounded-full animate-spin duration-[35s]" />
          </div>
        )}
      </div>

      {/* Header / Brand */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#0B2F89] rounded-xl flex items-center justify-center shadow-md">
            <Accessibility size={22} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">
            <span className="text-[#0B2F89]">Access</span>
            <span className="text-slate-800">Ride</span>
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
            ✨ Smart 3D Interactive Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Seamless Transportation <br className="hidden sm:block" />
            Designed For <span className="text-[#0B2F89]">Everyone</span>
          </h2>
          <p className="text-slate-650 text-base md:text-lg max-w-lg mx-auto font-semibold leading-relaxed">
            Welcome to AccessRide. Choose your portal below. Hover over each card to experience interactive 3D depth and dynamic custom media.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Rider Portal */}
          <Link
            to="/login"
            onMouseEnter={() => setHoveredPortal("rider")}
            onMouseMove={(e) => handleMouseMove(e, "rider")}
            onMouseLeave={() => handleMouseLeave("rider")}
            style={{ transform: tiltStyles.rider, transformStyle: "preserve-3d" }}
            className="group relative bg-white border border-slate-100 hover:border-[#0B2F89]/50 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-200 min-h-80 z-20"
          >
            <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
              <div className="w-14 h-14 bg-[#0B2F89] text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-900/20 group-hover:rotate-6 transition-transform">
                <Accessibility size={28} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0B2F89] mb-2">Rider Portal</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Book dynamic rides, monitor GPS tracking, share OTPs, and schedule accessibility vehicles instantly.
              </p>
            </div>
            <div 
              style={{ transform: "translateZ(20px)" }}
              className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all"
            >
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Driver Portal */}
          <Link
            to="/driver-login"
            onMouseEnter={() => setHoveredPortal("driver")}
            onMouseMove={(e) => handleMouseMove(e, "driver")}
            onMouseLeave={() => handleMouseLeave("driver")}
            style={{ transform: tiltStyles.driver, transformStyle: "preserve-3d" }}
            className="group relative bg-white border border-slate-100 hover:border-[#FEC329]/70 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-200 min-h-80 z-20"
          >
            <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
              <div className="w-14 h-14 bg-[#FEC329] text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform">
                <Car size={28} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Driver Portal</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Accept incoming requests, verify security OTPs, track monthly earnings, and manage your vehicle status.
              </p>
            </div>
            <div 
              style={{ transform: "translateZ(20px)" }}
              className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all"
            >
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Admin Panel */}
          <Link
            to="/admin-login"
            onMouseEnter={() => setHoveredPortal("admin")}
            onMouseMove={(e) => handleMouseMove(e, "admin")}
            onMouseLeave={() => handleMouseLeave("admin")}
            style={{ transform: tiltStyles.admin, transformStyle: "preserve-3d" }}
            className="group relative bg-white border border-slate-100 hover:border-slate-300 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-200 min-h-80 z-20"
          >
            <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Admin Panel</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Monitor live travel routes, resolve emergency SOS triggers, update driver verification, and inspect logs.
              </p>
            </div>
            <div 
              style={{ transform: "translateZ(20px)" }}
              className="flex items-center gap-2 text-xs font-bold text-[#0B2F89] mt-8 group-hover:gap-3.5 transition-all"
            >
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-450 relative z-20">
        <div className="bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
          © {new Date().getFullYear()} AccessRide Mobility. All rights reserved.
        </div>
        <div className="flex gap-6 font-semibold bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
          <span className="text-slate-500 hover:text-[#0B2F89] transition cursor-pointer">Security & Audit</span>
          <span className="text-slate-500 hover:text-[#0B2F89] transition cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginSelector;