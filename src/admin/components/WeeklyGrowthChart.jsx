import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const FILTER_OPTIONS = [
  { value: "day",   label: "Today",      desc: "Last 24 Hours" },
  { value: "week",  label: "This Week",  desc: "Last 7 Days"   },
  { value: "month", label: "This Month", desc: "Last 30 Days"  },
];

const WeeklyGrowthChart = () => {
  const [users,   setUsers]   = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter,  setFilter]  = useState("week");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDark = document.body.classList.contains("dark");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost/admin/api/weekly_growth.php?filter=${filter}`)
      .then((res) => {
        setUsers(Array.isArray(res.data?.users)   ? res.data.users   : []);
        setDrivers(Array.isArray(res.data?.drivers) ? res.data.drivers : []);
      })
      .catch(() => { setUsers([]); setDrivers([]); })
      .finally(() => setLoading(false));
  }, [filter]);

  const labels = users.map((d) => d.label || "N/A");

  const totalUsers   = users.reduce((s, d)   => s + (d.total_users   || 0), 0);
  const totalDrivers = drivers.reduce((s, d) => s + (d.total_drivers || 0), 0);

  const data = {
    labels,
    datasets: [
      {
        label: "New Riders",
        data: users.map((d) => d.total_users || 0),
        borderColor: isDark ? "#60a5fa" : "#2563eb",
        backgroundColor: isDark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.10)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? "#60a5fa" : "#2563eb",
        pointBorderColor: isDark ? "#1e293b" : "#fff",
        pointBorderWidth: 2,
        tension: 0.45,
        fill: true,
      },
      {
        label: "New Drivers",
        data: drivers.map((d) => d.total_drivers || 0),
        borderColor: isDark ? "#34d399" : "#059669",
        backgroundColor: isDark ? "rgba(52,211,153,0.10)" : "rgba(5,150,105,0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? "#34d399" : "#059669",
        pointBorderColor: isDark ? "#1e293b" : "#fff",
        pointBorderWidth: 2,
        tension: 0.45,
        fill: true,
        borderDash: [6, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: isDark ? "#cbd5e1" : "#374151",
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 11, weight: "600" },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor:      isDark ? "#f1f5f9" : "#111827",
        bodyColor:       isDark ? "#94a3b8" : "#6b7280",
        borderColor:     isDark ? "#334155" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} new`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? "#94a3b8" : "#6b7280", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: isDark ? "#1e293b" : "#f1f5f9", drawTicks: false },
        ticks: { color: isDark ? "#94a3b8" : "#6b7280", font: { size: 11 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const selected = FILTER_OPTIONS.find((o) => o.value === filter);

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl flex flex-col gap-5">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-3">
          {/* Icon accent */}
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 leading-tight">
              Platform Growth
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              Rider &amp; driver registrations · {selected?.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stat pills */}
          <div className="hidden md:flex gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 dark:text-slate-500">Riders</span>
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{totalUsers}</span>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 self-center" />
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 dark:text-slate-500">Drivers</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalDrivers}</span>
            </div>
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {selected?.label}
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilter(opt.value); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40 ${
                      filter === opt.value
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold"
                        : "text-gray-700 dark:text-slate-300"
                    }`}
                  >
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend pills */}
      <div className="flex gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Riders
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" style={{backgroundImage:"repeating-linear-gradient(90deg,currentColor 0 4px,transparent 4px 7px)"}} /> Drivers
        </span>
      </div>

      {/* CHART */}
      <div className="h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">Loading growth data…</p>
          </div>
        ) : labels.length === 0 ? (
          <div className="text-center">
            <p className="text-4xl mb-2">📈</p>
            <p className="text-gray-400 dark:text-slate-500 font-medium">No growth data available</p>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default WeeklyGrowthChart;
