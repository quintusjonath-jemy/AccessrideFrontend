import React from 'react';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SideMenu = ({ menuOpen, setMenuOpen }) => {
  return (
    <>
      {/* Side Menu Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}></div>
      
      {/* Side Menu */}
      <nav className={`fixed top-0 left-0 h-full w-[250px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-100">
          <h2 className="text-xl font-extrabold text-[#0B2F89]">Menu</h2>
          <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-500" /></button>
        </div>
        <ul className="p-4 flex flex-col gap-2">
          {['History', 'Profile', 'Ratings', 'Complaints', 'Settings'].map(item => (
            <li key={item}>
              <Link to={`/${item.toLowerCase()}`} className="block px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold transition-colors" onClick={() => setMenuOpen(false)}>
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default SideMenu;


