import React from 'react';
import { Menu, CircleUser } from 'lucide-react';

const ProfileHeader = ({ handleActionClick }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-10">
      <button className="text-[#0d1b2a]" onClick={() => handleActionClick('Menu')}>
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-extrabold text-[#0d1b2a] m-0">AccessRide</h1>
      <button className="text-[#0d1b2a] flex items-center justify-center">
        <CircleUser className="w-7 h-7" />
      </button>
    </header>
  );
};

export default ProfileHeader;
