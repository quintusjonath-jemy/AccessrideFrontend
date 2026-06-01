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

  useEffect(() => {
    axios
      .get(`http://localhost/admin/api/chart_stats.php?filter=${filter}`)

      .then((res) => {
        setChartData(res.data);
      })

      .catch((err) => {
        console.log(err);
      });
  }, [filter]);

  const data = {
    labels: chartData.map((item) => item.ride_date),

    datasets: [
      {
        label: "Ride Activity",

        labels: chartData.map((item) => item.label),

        borderColor: "#2563eb",

        backgroundColor: "rgba(37,99,235,0.2)",

        tension: 0.4,

        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Ride Activity
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Live ride analytics from database
          </p>
        </div>

        {/* FILTER */}

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className=" bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-md border-none outline-none cursor-pointer text-sm font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          <option value="day" className="text-black bg-white">
            Day
          </option>

          <option value="week" className="text-black bg-white">
            Week
          </option>

          <option value="month" className="text-black bg-white">
            Month
          </option>
        </select>
      </div>

      <div className="h-[350px] mt-4">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                position: "top",
              },
            },

            interaction: {
              mode: "index",
              intersect: false,
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
          }}
        />
      </div>
    </div>
  );
}

export default ActivityChart;
