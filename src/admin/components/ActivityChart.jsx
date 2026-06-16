import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
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
);

const ActivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost/admin/api/chart_stats.php?filter=${filter}`,
        );

        setChartData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Chart data error:", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const labels = chartData.map((item) => item.ride_date || "N/A");
  const values = chartData.map((item) => item.count || 0);

  const isDark = document.body.classList.contains("dark");

  const data = {
    labels,
    datasets: [
      {
        label: "Ride Activity",
        data: values,
        borderColor: isDark ? "#3b82f6" : "#2563eb",
        backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(37, 99, 235, 0.15)",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#cbd5e1" : "#374151",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? "#334155" : "#f1f5f9",
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
        }
      },
    },
  };

  const FilterDropdown = ({ filter, setFilter }) => {
    const [open, setOpen] = useState(false);

    const options = [
      { value: "day", label: "Last 24 Hours", desc: "Today’s activity" },
      { value: "week", label: "Last 7 Days", desc: "Weekly overview" },
      { value: "month", label: "Last 30 Days", desc: "Monthly trend" },
    ];

    const selected = options.find((o) => o.value === filter);

    return (
      <div className="relative w-56">
        {/* Button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm text-left hover:shadow-md transition-all text-gray-700 dark:text-slate-200"
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
              {selected?.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-400">{selected?.desc}</p>
          </div>

          <span className="text-gray-400 dark:text-slate-500 text-xs">▼</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute mt-2 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-50">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setFilter(opt.value);
                  setOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                  filter === opt.value ? "bg-blue-50 dark:bg-blue-950/40" : ""
                }`}
              >
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-400">{opt.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Ride Activity Analytics
          </h2>
          <p className="text-sm text-gray-400 dark:text-slate-400">
            Real-time ride performance overview
          </p>
        </div>

        {/* FILTER */}
        <FilterDropdown filter={filter} setFilter={setFilter} />
      </div>

      {/* CONTENT */}
      <div className="h-[350px] flex items-center justify-center">
        {loading ? (
          <p className="text-gray-400 dark:text-slate-500 animate-pulse">Loading chart...</p>
        ) : chartData.length === 0 ? (
          <p className="text-gray-400 dark:text-slate-500">No data available</p>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default ActivityChart;
