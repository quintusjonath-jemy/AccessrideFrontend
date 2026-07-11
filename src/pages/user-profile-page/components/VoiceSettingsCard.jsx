import React from 'react';
import { Mic } from 'lucide-react';

const VoiceSettingsCard = ({ voiceGuidance, setVoiceGuidance, voiceSpeed, setVoiceSpeed }) => {
  const speedBtnClass = (speed) => {
    const isActive = voiceSpeed === speed;
    return `flex-1 py-2.5 rounded-md font-bold text-sm transition-colors ${
      isActive ? 'bg-[#0B2F89] text-white shadow' : 'text-slate-800'
    }`;
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-5">
        <Mic className="text-[#0B2F89] w-6 h-6" />
        <h3 className="text-xl font-extrabold text-[#0B2F89] m-0">Voice Settings</h3>
      </div>
      
      <div className="bg-slate-100 border border-slate-300 rounded-2xl py-3.5 px-4 mb-3 flex justify-between items-center">
        <span className="font-bold text-sm text-slate-800">Voice Guidance</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={voiceGuidance}
            onChange={(e) => setVoiceGuidance(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-12 h-6 bg-slate-1000 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#FEC329]"></div>
        </label>
      </div>

      <div className="bg-slate-100 border border-slate-300 rounded-2xl py-3.5 px-4">
        <span className="font-bold text-sm text-slate-800 block mb-3">Voice Speed</span>
        <div className="flex bg-slate-200 rounded-2xl p-1 gap-1">
          <button onClick={() => setVoiceSpeed('slow')} className={speedBtnClass('slow')}>Slow</button>
          <button onClick={() => setVoiceSpeed('normal')} className={speedBtnClass('normal')}>Normal</button>
          <button onClick={() => setVoiceSpeed('fast')} className={speedBtnClass('fast')}>Fast</button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsCard;



