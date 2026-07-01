import React from 'react';
import { Star } from 'lucide-react';
import SuccessMessage from './SuccessMessage';

const RatingSection = ({ isRated, rating, handleRating, driverName }) => {
  if (isRated) {
    return <SuccessMessage rating={rating} driverName={driverName} />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-2 flex flex-col items-center justify-center text-center shadow-sm">
      <h3 className="text-[#0d1b2a] font-extrabold mb-4">Rate your driver</h3>
      <div className="flex gap-2 text-3xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => handleRating(star)} className="focus:outline-none">
            <Star
              className={`w-8 h-8 cursor-pointer transition-colors ${
                rating >= star ? 'fill-[#ffb703] text-[#ffb703]' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingSection;
