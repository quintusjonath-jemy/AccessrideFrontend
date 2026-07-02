import React from 'react';
import { Home, CalendarDays, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[75px] bg-white/90 backdrop-blur-md flex justify-around items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-4 z-30 border-t border-slate-100">
      <Link to="/user" className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl font-bold text-xs text-slate-400 hover:text-[#0B2F89] hover:bg-slate-100 transition-all">
        <Home className="w-6 h-6" />
        <span>Home</span>
      </Link>
      <Link to="/history" className="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#FEC329] to-[#FEC329] text-[#0B2F89] shadow-lg shadow-orange-500/20 -mt-6 border-4 border-white transition-transform hover:scale-105">
        <CalendarDays className="w-6 h-6" />
        <span>History</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl font-bold text-xs text-slate-400 hover:text-[#0B2F89] hover:bg-slate-100 transition-all">
        <User className="w-6 h-6" />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;


