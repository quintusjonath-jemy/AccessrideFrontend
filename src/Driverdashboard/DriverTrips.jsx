import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const DriverTrips = () => {
  const navigate = useNavigate();

  const stats = useMemo(
    () => [
      { label: "Average Rating", value: "4.8", icon: "⭐", color: "text-yellow-500" },
      { label: "Acceptance Rate", value: "95%", icon: "✔", color: "text-green-500" },
    ],
    []
  );

  const recentTrips = useMemo(
    () => [
      { initials: "PA", name: "Passenger A.", time: "Today, 2:45 PM", amount: "Rs. 100.00" },
      { initials: "MK", name: "Michael K.", time: "Yesterday", amount: "Rs. 250.00" },
      { initials: "JS", name: "John S.", time: "2 days ago", amount: "Rs. 150.00" },
    ],
    []
  );

  const tips = useMemo(
    () => [
      {
        title: "Keep Vehicle Clean",
        description: "Clean interiors improve ratings.",
        button: "Learn More",
        style: "bg-yellow-200 text-slate-900",
      },
      {
        title: "Greet Passengers",
        description: "Polite behavior increases tips.",
        button: "View Tips",
        style: "bg-red-200 text-slate-900",
      },
    ],
    []
  );

  return (
    <div className="bg-gray-200 flex justify-center min-h-screen py-6 px-3">
      <div className="w-full max-w-[360px] bg-white min-h-screen shadow-lg rounded-[2rem] overflow-hidden">
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <h1 className="text-[#00236F] font-bold">🚕 AccessRide</h1>
          <img src="/src/Driverdashboard/drivering.webp" alt="Driver avatar" className="w-8 h-8 rounded-full" />
        </div>

        <div className="p-4">
          <h2 className="font-bold text-gray-800">Trips & Feedback</h2>
          <p className="text-xs text-gray-500">WEEKLY PERFORMANCE REVIEW</p>
        </div>

        <div className="mx-4 bg-[#00236F] text-white rounded-2xl p-4 shadow-lg">
          <p className="text-sm">This Week's Trips</p>
          <h2 className="text-2xl font-bold mt-1">Rs. 1,850.00</h2>

          <div className="mt-2 bg-gray-400 h-1 rounded">
            <div className="bg-white h-1 w-[70%] rounded" />
          </div>

          <p className="text-xs mt-2 text-gray-300">Goal: Rs. 2,500.00</p>
        </div>

        <div className="flex gap-3 px-4 mt-4">
          {stats.map((item) => (
            <div key={item.label} className="flex-1 bg-gray-100 p-3 rounded-xl text-center">
              <p className={`${item.color} text-lg`}>{item.icon}</p>
              <p className="font-bold text-lg">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="px-4 mt-5">
          <div className="flex justify-between">
            <h3 className="font-semibold">Recent Trips</h3>
            <p className="text-xs text-blue-500 cursor-pointer">View All</p>
          </div>

          <div className="mt-3 space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.name} className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-300 w-8 h-8 flex items-center justify-center rounded-full text-xs">{trip.initials}</div>
                  <div>
                    <p className="text-sm font-medium">{trip.name}</p>
                    <p className="text-xs text-gray-500">{trip.time}</p>
                  </div>
                </div>
                <p className="text-green-600 font-semibold">{trip.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 mt-6">
          <h3 className="font-semibold mb-2">Pro Tips for Better Ratings</h3>

          <div className="flex gap-3">
            {tips.map((tip) => (
              <div key={tip.title} className={`flex-1 ${tip.style} p-3 rounded-xl`}>
                <h4 className="font-semibold text-sm">{tip.title}</h4>
                <p className="text-xs mt-1">{tip.description}</p>
                <button className="mt-2 bg-black text-white text-xs px-3 py-1 rounded">{tip.button}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-around py-3 border-t mt-6 bg-white">
          <button onClick={() => navigate("/driver-dashboard")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">🏠</span>
            <p className="text-xs">Home</p>
          </button>
          <button className="flex flex-col items-center text-yellow-500">
            <span className="text-xl">🚗</span>
            <p className="text-xs">Trips</p>
          </button>
          <button onClick={() => navigate("/driver-earnings")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">💰</span>
            <p className="text-xs">Earnings</p>
          </button>
          <button onClick={() => navigate("/driver-dashboard")} className="flex flex-col items-center text-gray-500 hover:text-[#00236F]">
            <span className="text-xl">👤</span>
            <p className="text-xs">Profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverTrips;
