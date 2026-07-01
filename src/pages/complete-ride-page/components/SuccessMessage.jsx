import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SuccessMessage = ({ rating, driverName }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-2 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="py-2 animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10 text-green-700 mx-auto mb-3" />
        <h3 className="text-[#0d1b2a] font-extrabold text-lg mb-1">Thank You!</h3>
        <p className="text-slate-500 font-medium text-sm">
          You rated {driverName?.split(' ')[0] || 'driver'} {rating} stars.
        </p>
      </div>
    </div>
  );
};

export default SuccessMessage;
