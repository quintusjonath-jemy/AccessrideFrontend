import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Earnings = () => {
  const navigate = useNavigate();

  const [isOnline] = useState(() => {
    const stored = localStorage.getItem("driverOnlineStatus");
    return stored ? JSON.parse(stored) : true;
  });

  const transactions = useMemo(
    () => [
      { time: "Today, 10:30 AM", trip: "Trip #AR-9402", amount: "+ Rs. 640.00" },
      { time: "Today, 08:15 AM", trip: "Trip #AR-9398", amount: "+ Rs. 420.00" },
      { time: "Yesterday, 11:45 PM", trip: "Trip #AR-9350", amount: "+ Rs. 1,120.00" },
    ],
    []
  );

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-slate-100 sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#FEC329]">Access</span>
          <span className="text-[#0B2F89]">Ride</span>
        </h1>
        <img 
          src="/src/Driverdashboard/drivering.webp" 
          alt="Driver avatar" 
          className="h-10 w-10 rounded-full object-cover shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-2 border-white bg-white" 
          onError={(e) => { e.target.src = "/src/Driverdashboard/drivering.webp"; }}
        />
      </header>

      <div className="bg-gray-100 p-4">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-[#00236F] font-bold">Hello, Driver</h2>
            <p className="text-sm text-gray-600">Weekly earnings summary</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Status</p>
            <p className={`font-bold ${isOnline ? "text-emerald-600" : "text-rose-500"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#00236F] text-white p-5 rounded-2xl m-3 shadow-lg">
        <p className="text-sm opacity-80">Active Period</p>
        <h2 className="text-2xl font-semibold mb-3">Weekly Earnings</h2>
        <div className="text-4xl font-bold mb-4">Rs. 12,450.00</div>
        <div className="bg-blue-800 p-3 rounded-xl flex justify-between items-center">
          <span>Payout scheduled: Mon</span>
          <span className="text-xl">📅</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Trips</p>
          <h2 className="text-2xl font-bold">42</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Online</p>
          <h2 className="text-2xl font-bold">34h</h2>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow mx-3 mb-4">
        <p className="font-semibold mb-3">Earnings Breakdown</p>
        <div className="h-28 bg-gray-200 rounded-3xl flex items-center justify-center text-gray-500">
          Chart preview here
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow mx-3 mb-4">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Recent Transactions</h2>
          <button className="text-[#00236F] text-sm font-medium">View All</button>
        </div>

        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.trip} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{txn.time}</p>
                <p className="text-sm text-gray-500">{txn.trip}</p>
              </div>
              <p className="text-green-600 font-semibold">{txn.amount}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow mx-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Need help with earnings?</span>
          <button className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-[#00236F] font-semibold">Get Support</button>
        </div>
      </div>

    </>
  );
};

export default Earnings;
