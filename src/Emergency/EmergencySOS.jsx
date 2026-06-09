import { useState } from "react";
import { FiPhoneCall, FiMapPin, FiUsers, FiX, FiArrowLeft, FiUser } from "react-icons/fi";

const EmergencySOS = () => {
  const [sosActivated, setSOSActivated] = useState(false);

  const activateSOS = () => {
    setSOSActivated(true);
    fetch("http://localhost/AccessrideBackend/Emergency/sos.php", { method: "POST" });
    alert("SOS activated! Help is on the way.");
  };

  const cancelSOS = () => {
    setSOSActivated(false);
    alert("SOS cancelled");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-6 ring-1 ring-slate-200">
        <header className="flex items-center justify-between mb-6">
          <button className="text-slate-600 hover:text-slate-900 text-xl">
            <FiArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="font-bold text-lg text-slate-900">Emergency Help</h2>
          <div className="text-xl">👤</div>
        </header>

        <div className="text-center mt-8">
          <button
            onClick={activateSOS}
            disabled={sosActivated}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl font-bold border-8 shadow-2xl transition transform hover:scale-105 active:scale-95 ${
              sosActivated
                ? "bg-red-700 text-white border-yellow-400 cursor-not-allowed"
                : "bg-red-600 text-white border-yellow-400 hover:bg-red-700"
            }`}
          >
            SOS
            <div className="absolute text-xs font-semibold mt-14">PRESS</div>
          </button>
          <p className="mt-6 text-sm text-slate-600 font-medium">Press the SOS button to activate emergency</p>
        </div>

        {sosActivated && (
          <div className="mt-6 bg-red-50 p-4 rounded-3xl border-2 border-red-300 text-center ring-1 ring-red-200">
            <p className="font-semibold text-red-900">🚨 Contacting help...</p>
            <p className="text-sm text-red-700 mt-1">Location shared successfully</p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <FiPhoneCall className="h-5 w-5" /> Call Driver
          </button>
          <button className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <FiUsers className="h-5 w-5" /> Call Emergency Contact
          </button>
          <button className="w-full bg-slate-900 text-white py-3 rounded-3xl font-medium transition hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <FiMapPin className="h-5 w-5" /> Share Live Location
          </button>
        </div>

        <button
          onClick={cancelSOS}
          disabled={!sosActivated}
          className="mt-6 w-full border-2 border-red-500 text-red-600 py-3 rounded-3xl font-medium transition enabled:hover:bg-red-50 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          <FiX className="h-5 w-5" /> Cancel SOS
        </button>
      </div>
    </div>
  );
};

export default EmergencySOS;
