import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function ActivityChart() {

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    datasets: [
      {
        label: "Navigation Activity",
        data: [12, 19, 10, 25, 18, 30],
      },
    ],
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md">

      <h2 className="text-xl font-bold mb-5">
        Weekly Activity
      </h2>

      <Line data={data} />

    </div>
  )
}

export default ActivityChart