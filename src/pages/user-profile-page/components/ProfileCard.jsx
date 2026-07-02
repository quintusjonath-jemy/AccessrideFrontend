import React from 'react';
import { User, BadgeCheck, Phone, Mail, Pencil } from 'lucide-react';

const ProfileCard = ({ userData, handleActionClick }) => {
  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="relative mb-4">
        <div className="w-[100px] h-[100px] rounded-full border-[2px] border-[#0B2F89] bg-white flex items-center justify-center overflow-hidden">
            <User className="w-16 h-16 text-slate-300" />
        </div>
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px] flex">
          <BadgeCheck className="text-[#0B2F89] fill-[#FEC329] w-7 h-7" />
        </div>
      </div>
      <h2 className="text-[1.5rem] font-extrabold text-[#0B2F89] m-0 mb-3">{userData.name}</h2>
      
      <div className="flex flex-col gap-2 mb-6 w-full">
        <div className="flex items-center justify-center gap-2.5 text-slate-500 font-medium text-sm">
          <Phone className="w-3.5 h-3.5" />
          <span>{userData.phone}</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 text-slate-500 font-medium text-sm">
          <Mail className="w-3.5 h-3.5" />
          <span>{userData.email}</span>
        </div>
      </div>

      <button 
        onClick={() => handleActionClick('Edit Profile')}
        className="w-full bg-[#0B2F89] text-white py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2.5 active:opacity-80 transition-opacity text-base"
      >
        <Pencil className="w-4 h-4" /> Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;



