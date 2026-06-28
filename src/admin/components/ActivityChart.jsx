import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const FILTER_OPTIONS = [
  { value: "day",   label: "Today",        desc: "Last 24 Hours" },
  { value: "week",  label: "This Week",    desc: "Last 7 Days"   },
  { value: "month", label: "This Month",   desc: "Last 30 Days"  },
];

// Status colour palette for stacked bars
const STATUS_CONFIG = {
  active:    { color: "#22c55e", dark: "#4ade80",  label: "Active"    },
  pending:   { color: "#f59e0b", dark: "#fbbf24",  label: "Pending"   },
  completed: { color: "#3b82f6", dark: "#60a5fa",  label: "Completed" },
  cancelled: { color: "#ef4444", dark: "#f87171",  label: "Cancelled" },
};

const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter]       = useState("week");
  const [loading, setLoading]     = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDark = document.body.classList.contains("dark");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost/admin/api/chart_stats.php?filter=${filter}`)
      .then((res) => setChartData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const labels = chartData.map((d) => d.ride_date || "N/A");

  // Build one dataset per status from the raw data
  const statuses = Object.keys(STATUS_CONFIG);
  const datasets = statuses.map((status) => {
    const cfg = STATUS_CONFIG[status];
    return {
      label: cfg.label,
      data: chartData.map((d) => d[status] ?? d.count ?? 0),
      backgroundColor: isDark ? cfg.dark + "cc" : cfg.color + "cc",
      borderColor:     isDark ? cfg.dark        : cfg.color,
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false,
    };
  });

  const data = { labels, datasets };

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
          pointStyle: "rectRounded",
          boxWidth: 10,
          boxHeight: 10,
          font: { size: 11, weight: "600" },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#fff",
        titleColor: isDark ? "#f1f5f9" : "#111827",
        bodyColor:  isDark ? "#94a3b8" : "#6b7280",
        borderColor: isDark ? "#334155" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} rides`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: isDark ? "#94a3b8" : "#6b7280", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: isDark ? "#1e293b" : "#f1f5f9", drawTicks: false },
        ticks: { color: isDark ? "#94a3b8" : "#6b7280", font: { size: 11 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const totalRides = chartData.reduce((sum, d) => sum + (d.count || 0), 0);

  const selected = FILTER_OPTIONS.find((o) => o.value === filter);

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl flex flex-col gap-5">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-3">
          {/* Icon accent */}
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-600 dark:text-blue-400" stroke="currentColor" strokeWidth="2">
              <path d="M3 17l4-8 4 4 4-6 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 leading-tight">
              Ride Activity
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              Status breakdown per {selected?.desc.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stat pill */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-gray-400 dark:text-slate-500">Total Rides</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{totalRides}</span>
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
                    className={`w-full text-left px-4 py-3 text-sm transition hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                      filter === opt.value ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-slate-300"
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

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <span
              key={s}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: (isDark ? cfg.dark : cfg.color) + "18",
                borderColor:     (isDark ? cfg.dark : cfg.color) + "44",
                color:            isDark ? cfg.dark : cfg.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: isDark ? cfg.dark : cfg.color }} />
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* CHART */}
      <div className="h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">Loading ride data…</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400 dark:text-slate-500 font-medium">No ride data available</p>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default ActivityChart;
