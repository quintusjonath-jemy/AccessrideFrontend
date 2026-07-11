import React from 'react';
import { Menu, Bell } from 'lucide-react';
import SideMenu from './SideMenu';

const HistoryHeader = ({ menuOpen, setMenuOpen }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm border-b border-slate-100">
      <button 
        className="text-[#0B2F89] hover:bg-slate-100 p-2 rounded-full transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <SideMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <h1 className="text-xl font-extrabold text-[#0B2F89] m-0 bg-clip-text text-transparent bg-gradient-to-r from-[#0B2F89] to-[#082366]">AccessRide</h1>
      <button className="text-[#0B2F89] hover:bg-slate-100 p-2 rounded-full transition-colors relative">
        <Bell className="w-6 h-6" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    </header>
  );
};

export default HistoryHeader;

