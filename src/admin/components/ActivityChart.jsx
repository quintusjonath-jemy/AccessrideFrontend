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
  Legend
);

function ActivityChart() {

  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    axios
      .get("http://localhost/admin/api/chart_stats.php")

      .then((res) => {
        setChartData(res.data);
      })

      .catch((err) => {
        console.log(err);
      });

  }, []);

  const data = {

    labels: chartData.map(
      (item) => item.ride_date
    ),

    datasets: [

      {
        label: "Ride Activity",

        data: chartData.map(
          (item) => item.total_rides
        ),

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

    <div className="bg-white p-5 rounded-2xl shadow-md mt-6">

      <div className="flex justify-between items-center mb-5">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Weekly Ride Activity
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Live ride analytics from database
          </p>

        </div>

      </div>

      <Line data={data} options={options} />

    </div>
  );
}

export default ActivityChart;