import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
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

const WeeklyGrowthChart = () => {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost/admin/api/weekly_growth.php?filter=${filter}`,
        );

        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
        setDrivers(Array.isArray(res.data?.drivers) ? res.data.drivers : []);
      } catch (err) {
        console.error("Growth chart error:", err);
        setUsers([]);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const labels = users.map((item) => item.label || "N/A");

  const data = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: users.map((item) => item.total_users || 0),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "New Drivers",
        data: drivers.map((item) => item.total_drivers || 0),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
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
          color: "#374151",
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
          color: "#f1f5f9",
        },
      },
      x: {
        grid: {
          display: false,
        },
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
          className="w-full flex items-center justify-between bg-white/80 backdrop-blur-md border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm text-left hover:shadow-md transition-all"
        >
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {selected?.label}
            </p>
            <p className="text-xs text-gray-400">{selected?.desc}</p>
          </div>

          <span className="text-gray-400 text-xs">▼</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setFilter(opt.value);
                  setOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer transition-all hover:bg-blue-50 ${
                  filter === opt.value ? "bg-blue-50" : ""
                }`}
              >
                <p className="text-sm font-semibold text-gray-700">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Platform Growth Analytics
          </h2>
          <p className="text-sm text-gray-400">
            New users and drivers growth overview
          </p>
        </div>

        {/* FILTER */}
        <div className="relative">
          <FilterDropdown filter={filter} setFilter={setFilter} />

          {/* dropdown icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[350px] flex items-center justify-center">
        {loading ? (
          <p className="text-gray-400 animate-pulse">Loading growth data...</p>
        ) : labels.length === 0 ? (
          <p className="text-gray-400">No growth data available</p>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default WeeklyGrowthChart;
