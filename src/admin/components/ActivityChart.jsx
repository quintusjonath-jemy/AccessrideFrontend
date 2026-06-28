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
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

// ─── helpers ──────────────────────────────────────────────────────────────────
const THIS_YEAR  = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const THIS_WEEK  = (() => {
  const d   = new Date();
  const jan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7);
})();

const YEARS  = Array.from({ length: 5 }, (_, i) => THIS_YEAR - i);
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKS  = Array.from({ length: 52 }, (_, i) => i + 1);

const STATUS_CONFIG = {
  active:    { color: "#22c55e", dark: "#4ade80", label: "Active"    },
  pending:   { color: "#f59e0b", dark: "#fbbf24", label: "Pending"   },
  completed: { color: "#3b82f6", dark: "#60a5fa", label: "Completed" },
  cancelled: { color: "#ef4444", dark: "#f87171", label: "Cancelled" },
};

// ─── sub-components ───────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow"
        : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

const Select = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700
      text-gray-700 dark:text-slate-200 text-sm font-semibold px-3 py-2 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${className}`}
  >
    {children}
  </select>
);

// ─── main component ───────────────────────────────────────────────────────────
const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // period mode: "year" | "month" | "week"
  const [mode,       setMode]       = useState("week");
  const [selYear,    setSelYear]    = useState(THIS_YEAR);
  const [selMonth,   setSelMonth]   = useState(THIS_MONTH);
  const [selWeek,    setSelWeek]    = useState(THIS_WEEK);

  const isDark = document.body.classList.contains("dark");

  // Build API query string based on mode
  const buildQuery = () => {
    if (mode === "year")  return `filter=year&year=${selYear}`;
    if (mode === "month") return `filter=month&year=${selYear}&month=${selMonth}`;
    if (mode === "week")  return `filter=week&year=${selYear}&week=${selWeek}`;
    return "filter=week";
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost/admin/api/chart_stats.php?${buildQuery()}`)
      .then((res) => setChartData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [mode, selYear, selMonth, selWeek]);

  const labels   = chartData.map((d) => d.label || "N/A");
  const statuses = Object.keys(STATUS_CONFIG);
  const totalRides = chartData.reduce((s, d) => s + (Number(d.count) || 0), 0);

  const datasets = statuses.map((status) => {
    const cfg = STATUS_CONFIG[status];
    return {
      label: cfg.label,
      data:  chartData.map((d) => Number(d[status]) || 0),
      backgroundColor: (isDark ? cfg.dark : cfg.color) + "cc",
      borderColor:     isDark ? cfg.dark : cfg.color,
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false,
    };
  });

  const chartConfig = {
    labels,
    datasets,
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
          pointStyle: "rectRounded",
          boxWidth: 10, boxHeight: 10,
          font: { size: 11, weight: "600" },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#fff",
        titleColor:      isDark ? "#f1f5f9" : "#111827",
        bodyColor:       isDark ? "#94a3b8" : "#6b7280",
        borderColor:     isDark ? "#334155" : "#e5e7eb",
        borderWidth: 1, padding: 12, cornerRadius: 12,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} rides` },
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

  // ── label for current selection ──────────────────────────────────────────
  const selectionLabel = (() => {
    if (mode === "year")  return `Year ${selYear}`;
    if (mode === "month") return `${MONTHS[selMonth - 1]} ${selYear}`;
    if (mode === "week")  return `Week ${selWeek}, ${selYear}`;
    return "";
  })();

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
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
              {selectionLabel} · status breakdown
            </p>
          </div>
        </div>

        {/* Total rides pill */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-gray-400 dark:text-slate-500">Total Rides</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{totalRides}</span>
        </div>
      </div>

      {/* ── FILTER ROW ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-900/50 p-1 rounded-2xl">
          {["year","month","week"].map((m) => (
            <TabBtn key={m} active={mode === m} onClick={() => setMode(m)}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </TabBtn>
          ))}
        </div>

        {/* Year selector (always visible) */}
        <Select value={selYear} onChange={(v) => setSelYear(Number(v))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>

        {/* Month selector */}
        {mode === "month" && (
          <Select value={selMonth} onChange={(v) => setSelMonth(Number(v))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Select>
        )}

        {/* Week selector */}
        {mode === "week" && (
          <Select value={selWeek} onChange={(v) => setSelWeek(Number(v))}>
            {WEEKS.map((w) => <option key={w} value={w}>Week {w}</option>)}
          </Select>
        )}
      </div>

      {/* ── STATUS PILLS ── */}
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

      {/* ── CHART ── */}
      <div className="h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">Loading ride data…</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400 dark:text-slate-500 font-medium">No ride data for {selectionLabel}</p>
          </div>
        ) : (
          <Bar data={chartConfig} options={options} />
        )}
      </div>
    </div>
  );
};

export default ActivityChart;
