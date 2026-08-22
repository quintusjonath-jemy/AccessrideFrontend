import React from 'react';
import { Accessibility } from 'lucide-react';

const AccessibilityCard = ({ highContrast, setHighContrast, textSize, setTextSize }) => {
  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-5">
        <Accessibility className="text-[#0B2F89] w-6 h-6" />
        <h3 className="text-xl font-extrabold text-[#0B2F89] m-0">Accessibility</h3>
      </div>
      
      <div className="bg-slate-100 border border-slate-300 rounded-2xl py-3.5 px-4 mb-3 flex justify-between items-center">
        <span className="font-bold text-sm text-slate-800">High Contrast Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-12 h-6 bg-slate-1000 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#0B2F89]"></div>
        </label>
      </div>

      <div className="bg-slate-100 border border-slate-300 rounded-2xl py-3.5 px-4">
        <span className="font-bold text-sm text-slate-800 block mb-4">Text Size</span>
        <div className="flex items-center gap-4 px-1">
          <span className="font-extrabold text-slate-800 text-sm">A</span>
          <input 
            type="range" 
            min="1" 
            max="3" 
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-2xl appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-[#0B2F89]"
          />
          <span className="font-extrabold text-slate-800 text-xl">AAA</span>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityCard;



