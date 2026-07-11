import React from 'react';
import { Home, CalendarDays, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[70px] bg-white flex justify-around items-center rounded-t-[12px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 z-20">
      <Link to="/user" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] text-slate-500 transition-colors no-underline">
        <Home className="w-6 h-6" />
        <span>Home</span>
      </Link>
      <Link to="/history" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] text-slate-500 transition-colors no-underline">
        <CalendarDays className="w-6 h-6" />
        <span>History</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1 py-2 px-[30px] rounded-xl font-bold text-[0.8rem] bg-[#FEC329] text-[#0B2F89] transition-colors no-underline">
        <User className="w-6 h-6" />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;

