const StatsCard = ({ title, value, bg, icon }) => {
  return (
    <div
      className={`${bg} p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between gap-4`}
    >
      {/* Text */}
      <div>
        <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
          {title}
        </p>
        <p className="text-white text-4xl font-extrabold mt-1 leading-none">
          {value}
        </p>
      </div>

      {/* Icon bubble */}
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-2xl">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatsCard;