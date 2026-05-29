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

function WeeklyGrowthChart() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("week");
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    axios
      .get(
        `http://localhost/admin/api/weekly_growth.php?filter=${filter}`,
      )

      .then((res) => {
        setUsers(res.data.users || []);

        setDrivers(res.data.drivers || []);
      })

      .catch((err) => {
        console.log(err);
      });
  }, [filter]);

  const labels = users.map((item) => item.label);

  const data = {
    labels,

    datasets: [
      {
        label: "New Users",

        data: users.map((item) => item.total_users),

        borderColor: "#2563eb",

        backgroundColor: "rgba(37,99,235,0.2)",

        tension: 0.4,

        fill: true,
      },

      {
        label: "New Drivers",

        data: drivers.map((item) => item.total_drivers),

        borderColor: "#16a34a",

        backgroundColor: "rgba(22,163,74,0.2)",

        tension: 0.4,

        fill: true,
      },
    ],
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Platform Growth</h2>

          <p className="text-sm text-gray-400 mt-1">
            Newly registered users and drivers
          </p>
        </div>

        {/* FILTER */}

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="day">Day</option>

          <option value="week">Week</option>

          <option value="month">Month</option>
        </select>
      </div>

      <Line data={data} />
    </div>
  );
}

export default WeeklyGrowthChart;
