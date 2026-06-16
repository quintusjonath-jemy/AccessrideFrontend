import axios from "axios";
import { useEffect, useState } from "react";
import { Coins, TrendingUp, CreditCard, Award, Search, User, Car } from "lucide-react";

const Earnings = () => {
  const [platform, setPlatform] = useState({
    total_gross_fare: 0,
    commission_rate: 20,
    commission_earnings: 0,
    subscription_earnings: 0,
    total_earnings: 0,
    total_completed_rides: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/earnings.php")
      .then((res) => {
        if (res.data.success) {
          setPlatform(res.data.platform);
          setDrivers(res.data.drivers || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Earnings fetch error:", err);
        setLoading(false);
      });
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const query = searchQuery.toLowerCase();
    return (
      (driver.name || "").toLowerCase().includes(query) ||
      (driver.phone || "").toLowerCase().includes(query) ||
      (driver.vehicle_number || "").toLowerCase().includes(query) ||
      (driver.vehicle_type || "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Earnings Settings</h1>
        <p className="text-blue-100 mt-2">
          Monitor platform service fees, active driver membership subscriptions, and driver payouts
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL PLATFORM EARNINGS */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Total Platform Revenue
            </h3>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Coins size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Rs. {platform.total_earnings.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400 dark:text-slate-500 block mt-2">
            Commissions + Subscriptions
          </span>
        </div>

        {/* RIDE COMMISSIONS */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Ride Commissions ({platform.commission_rate}%)
            </h3>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Rs. {platform.commission_earnings.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400 dark:text-slate-500 block mt-2">
            From {platform.total_completed_rides} completed rides
          </span>
        </div>

        {/* SUBSCRIPTION FEES */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Driver Memberships
            </h3>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Award size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Rs. {platform.subscription_earnings.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400 dark:text-slate-500 block mt-2">
            From active driver subscriptions
          </span>
        </div>

        {/* GROSS BOOKINGS VOLUME */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Gross Fare Volume
            </h3>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">
            Rs. {platform.total_gross_fare.toLocaleString()}
          </p>
          <span className="text-xs text-gray-400 dark:text-slate-500 block mt-2">
            Total completed fares value
          </span>
        </div>
      </div>

      {/* DRIVERS LIST CONTAINER */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-lg p-6 transition-colors">
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
              Drivers Payouts & Subscriptions
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Details of completed rides, gross fares, deducted commissions, and driver payouts
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search driver name, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-800 dark:text-slate-100 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 tracking-wider">
                <th className="px-6 py-4">Driver Details</th>
                <th className="px-6 py-4 text-center">Completed Rides</th>
                <th className="px-6 py-4">Gross Bookings</th>
                <th className="px-6 py-4">Commission Deducted (20%)</th>
                <th className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">Net Driver Payout (80%)</th>
                <th className="px-6 py-4">Membership Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 text-sm text-gray-700 dark:text-slate-300 transition-colors"
                  >
                    {/* DRIVER INFO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-100">
                            {driver.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                            📞 {driver.phone || "No phone"} • 🚗 {driver.vehicle_number || "No Vehicle"} ({driver.vehicle_type || "No Type"})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* COMPLETED RIDES */}
                    <td className="px-6 py-4 text-center font-medium">
                      {driver.completed_rides_count}
                    </td>

                    {/* GROSS FARES */}
                    <td className="px-6 py-4 font-semibold">
                      Rs. {driver.gross_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* COMMISSION DEDUCTED */}
                    <td className="px-6 py-4 text-red-500 font-medium">
                      - Rs. {driver.commission_deducted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* NET PAYOUT */}
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                      Rs. {driver.net_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* SUBSCRIPTION STATUS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            driver.subscription_status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : driver.subscription_status === "expired"
                              ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse"
                              : "bg-gray-100 text-gray-600 dark:bg-slate-750 dark:text-slate-400"
                          }`}
                        >
                          {driver.subscription_status === "active" ? "Active" : driver.subscription_status === "expired" ? "Expired" : "No Plan"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          Rs. {driver.subscription_amount || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">
                    No drivers earnings data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
