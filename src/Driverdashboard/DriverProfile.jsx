import { FiUser, FiSettings, FiHelpCircle, FiLogOut, FiChevronRight, FiStar, FiAward, FiShield } from "react-icons/fi";

const DriverProfile = () => {
  return (
    <>
      <div className="border-b border-slate-200 px-5 py-6 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      <div className="px-5 py-6 flex flex-col items-center bg-white border-b border-slate-100">
        <div className="relative">
          <img src="/src/Driverdashboard/drivering.webp" alt="Driver" className="h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-slate-50" />
          <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1.5 border-2 border-white">
            <FiShield className="text-white h-4 w-4" />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">John Doe</h2>
        <p className="text-sm text-slate-500 font-medium">Toyota Prius - WP ABC-1234</p>
        
        <div className="mt-6 w-full flex justify-between bg-slate-50 p-4 rounded-3xl ring-1 ring-slate-200">
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-xl font-bold text-slate-900">4.8</span>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FiStar className="text-amber-500" /> Rating</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-slate-200">
            <span className="text-xl font-bold text-slate-900">1.2k</span>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FiAward className="text-emerald-500" /> Trips</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-xl font-bold text-slate-900">2.5</span>
            <span className="text-xs text-slate-500 mt-1">Years</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Settings</p>
        
        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiUser className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Personal Information</p>
              <p className="text-xs text-slate-500">Edit your name, phone, & email</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiSettings className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Preferences</p>
              <p className="text-xs text-slate-500">App settings, notifications</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <FiHelpCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Support</p>
              <p className="text-xs text-slate-500">Help center, FAQs, contact us</p>
            </div>
          </div>
          <FiChevronRight className="text-slate-400 h-5 w-5" />
        </button>

        <button className="w-full bg-rose-50 p-4 rounded-2xl flex items-center justify-between shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100 mt-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full text-rose-600 ring-1 ring-rose-200">
              <FiLogOut className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-rose-700">Log Out</p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default DriverProfile;
