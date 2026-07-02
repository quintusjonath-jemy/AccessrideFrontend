import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, DollarSign } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
const WEEKS = Array.from({ length: 52 }, (_, i) => i + 1);

// ─── sub-components ───────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow"
        : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700
      text-gray-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
  >
    {children}
  </select>
);

// ─── main component ───────────────────────────────────────────────────────────
const WeeklyGrowthChart = () => {
  // "growth" | "earnings"
  const [chartType, setChartType] = useState("growth");
  
  // Growth State
  const [users,   setUsers]   = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Earnings State
  const [earnings, setEarnings] = useState([]);

  const [loading, setLoading] = useState(true);

  // period mode
  const [mode,     setMode]     = useState("week");
  const [selYear,  setSelYear]  = useState(THIS_YEAR);
  const [selMonth, setSelMonth] = useState(THIS_MONTH);
  const [selWeek,  setSelWeek]  = useState(THIS_WEEK);

  const isDark = document.body.classList.contains("dark");

  const buildQuery = () => {
    if (mode === "year")  return `filter=year&year=${selYear}`;
    if (mode === "month") return `filter=month&year=${selYear}&month=${selMonth}`;
    if (mode === "week")  return `filter=week&year=${selYear}&week=${selWeek}`;
    return "filter=week";
  };

  useEffect(() => {
    setLoading(true);
    const query = buildQuery();

    if (chartType === "growth") {
      axios
        .get(`http://localhost/admin/api/weekly_growth.php?${query}`)
        .then((res) => {
          setUsers(Array.isArray(res.data?.users)    ? res.data.users    : []);
          setDrivers(Array.isArray(res.data?.drivers)? res.data.drivers  : []);
        })
        .catch(() => { setUsers([]); setDrivers([]); })
        .finally(() => setLoading(false));
    } else {
      axios
        .get(`http://localhost/admin/api/earnings_chart.php?${query}`)
        .then((res) => {
          setEarnings(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setEarnings([]))
        .finally(() => setLoading(false));
    }
  }, [chartType, mode, selYear, selMonth, selWeek]);

  // ── Growth Chart Configuration ──
  const allGrowthLabels = [...new Set([
    ...users.map((d) => d.label),
    ...drivers.map((d) => d.label),
  ])];
  const userMap   = Object.fromEntries(users.map((d)   => [d.label, d.total_users   || 0]));
  const driverMap = Object.fromEntries(drivers.map((d) => [d.label, d.total_drivers || 0]));

  const totalUsers   = users.reduce((s, d)   => s + (Number(d.total_users)   || 0), 0);
  const totalDrivers = drivers.reduce((s, d) => s + (Number(d.total_drivers) || 0), 0);

  const growthData = {
    labels: allGrowthLabels,
    datasets: [
      {
        label: "New Riders",
        data: allGrowthLabels.map((lbl) => userMap[lbl] ?? 0),
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
        data: allGrowthLabels.map((lbl) => driverMap[lbl] ?? 0),
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

  // ── Earnings Chart Configuration ──
  const earningsLabels = earnings.map((e) => e.label || "N/A");
  const totalSubRevenue = earnings.reduce((s, e) => s + (Number(e.subscriptions) || 0), 0);
  const totalRideRevenue = earnings.reduce((s, e) => s + (Number(e.rides) || 0), 0);

  const earningsData = {
    labels: earningsLabels,
    datasets: [
      {
        label: "Subscription Rev",
        data: earnings.map((e) => e.subscriptions || 0),
        borderColor: isDark ? "#818cf8" : "#4f46e5",
        backgroundColor: isDark ? "rgba(129,140,248,0.12)" : "rgba(79,70,229,0.10)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? "#818cf8" : "#4f46e5",
        pointBorderColor: isDark ? "#1e293b" : "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Completed Ride Fares",
        data: earnings.map((e) => e.rides || 0),
        borderColor: isDark ? "#10b981" : "#059669",
        backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "rgba(5,150,105,0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? "#10b981" : "#059669",
        pointBorderColor: isDark ? "#1e293b" : "#fff",
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
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
          boxWidth: 8, boxHeight: 8,
          font: { size: 11, weight: "600" },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor:      isDark ? "#f1f5f9" : "#111827",
        bodyColor:       isDark ? "#94a3b8" : "#6b7280",
        borderColor:     isDark ? "#334155" : "#e5e7eb",
        borderWidth: 1, padding: 12, cornerRadius: 12,
        callbacks: {
          label: (ctx) => {
            if (chartType === "growth") {
              return ` ${ctx.dataset.label}: ${ctx.parsed.y} new`;
            } else {
              return ` ${ctx.dataset.label}: LKR ${ctx.parsed.y.toLocaleString("en-LK")}`;
            }
          }
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

  const selectionLabel = (() => {
    if (mode === "year")  return `Year ${selYear}`;
    if (mode === "month") return `${MONTHS[selMonth - 1]} ${selYear}`;
    if (mode === "week")  return `Week ${selWeek}, ${selYear}`;
    return "";
  })();

  const hasData = chartType === "growth" ? allGrowthLabels.length > 0 : earningsLabels.length > 0;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
            chartType === "growth" ? "bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-emerald-600/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            {chartType === "growth" ? (
              <TrendingUp size={20} strokeWidth={2} />
            ) : (
              <DollarSign size={20} strokeWidth={2} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-lg font-bold text-gray-800 dark:text-slate-100 leading-tight bg-transparent focus:outline-none cursor-pointer border-b border-dashed border-gray-300 dark:border-slate-600 pr-1"
              >
                <option value="growth">Platform Growth</option>
                <option value="earnings">Earnings Statistics</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
              {selectionLabel} · {chartType === "growth" ? "registrations" : "revenue overview"}
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-3 shrink-0">
          {chartType === "growth" ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 dark:text-slate-500">Riders</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{totalUsers}</span>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 dark:text-slate-500">Drivers</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{totalDrivers}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 dark:text-slate-500">Subs</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  LKR {totalSubRevenue.toLocaleString("en-LK")}
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 dark:text-slate-500">Ride Fares</span>
                <span className="text-base font-extrabold text-emerald-650 dark:text-emerald-400">
                  LKR {totalRideRevenue.toLocaleString("en-LK")}
                </span>
              </div>
            </>
          )}
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

        {/* Year */}
        <Select value={selYear} onChange={(v) => setSelYear(Number(v))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>

        {/* Month */}
        {mode === "month" && (
          <Select value={selMonth} onChange={(v) => setSelMonth(Number(v))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Select>
        )}

        {/* Week */}
        {mode === "week" && (
          <Select value={selWeek} onChange={(v) => setSelWeek(Number(v))}>
            {WEEKS.map((w) => <option key={w} value={w}>Week {w}</option>)}
          </Select>
        )}
      </div>

      {/* ── LEGEND PILLS ── */}
      <div className="flex gap-3">
        {chartType === "growth" ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Riders
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Drivers
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Subscription Rev
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ride Fares
            </span>
          </>
        )}
      </div>

      {/* ── CHART ── */}
      <div className="h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">Loading data…</p>
          </div>
        ) : !hasData ? (
          <div className="text-center">
            <p className="text-4xl mb-2">📈</p>
            <p className="text-gray-400 dark:text-slate-500 font-medium">No statistics for {selectionLabel}</p>
          </div>
        ) : (
          <Line data={chartType === "growth" ? growthData : earningsData} options={options} />
        )}
      </div>
    </div>
  );
};

export default WeeklyGrowthChart;
