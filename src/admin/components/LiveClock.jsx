import { useEffect, useState } from "react";

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // weekday + date format
  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short", // Fri
    day: "2-digit",   // 06
    month: "2-digit", // 05
    year: "numeric",  // 2026
  });

  // only hours and minutes
  const timeString = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-md border dark:border-slate-700">
      <p className="text-xl font-semibold text-center text-gray-800 dark:text-slate-100">{timeString}</p>

      <h2 className="text-lg text-gray-600 dark:text-slate-400">{dateString}</h2>
    </div>
  );
};

export default LiveClock;