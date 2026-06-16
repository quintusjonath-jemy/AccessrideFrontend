import axios from "axios";
import { useEffect, useState } from "react";
import { 
  Coins, 
  TrendingUp, 
  CreditCard, 
  Award, 
  Search, 
  User, 
  Car,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubscription, setFilterSubscription] = useState("all");

  const fetchEarningsData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    axios
      .get("http://localhost/admin/api/earnings.php")
      .then((res) => {
        if (res.data.success) {
          setPlatform(res.data.platform || {
            total_gross_fare: 0,
            commission_rate: 20,
            commission_earnings: 0,
            subscription_earnings: 0,
            total_earnings: 0,
            total_completed_rides: 0,
          });
          setDrivers(res.data.drivers || []);
        }
      })
      .catch((err) => {
        console.error("Earnings fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (driver.name || "").toLowerCase().includes(query) ||
      (driver.phone || "").toLowerCase().includes(query) ||
      (driver.vehicle_number || "").toLowerCase().includes(query) ||
      (driver.vehicle_type || "").toLowerCase().includes(query);

    const matchesSub =
      filterSubscription === "all" ||
      (filterSubscription === "active" && driver.subscription_status === "active") ||
      (filterSubscription === "expired" && driver.subscription_status === "expired") ||
      (filterSubscription === "none" && !["active", "expired"].includes(driver.subscription_status));

    return matchesSearch && matchesSub;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">Earnings Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Monitor platform service fees, active driver membership subscriptions, and driver payouts</p>
        </div>
        <button
          onClick={() => fetchEarningsData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-5 py-2.5 rounded-xl font-semibold shadow-md hover:scale-105 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Platform Revenue */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-slate-900 font-bold text-xs uppercase tracking-wider opacity-70">Total Platform Revenue</p>
              <h3 className="text-2xl font-black text-slate-950 mt-2">
                Rs. {loading ? "0" : platform.total_earnings.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-white/20 rounded-xl text-slate-950">
              <Coins size={18} />
            </div>
          </div>
          <div className="text-[10px] text-slate-900 font-bold mt-auto z-10">
            <span className="bg-white/30 px-2 py-0.5 rounded-full">Commissions + Subscriptions</span>
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Ride Commissions */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Ride Commissions ({platform.commission_rate}%)</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                Rs. {loading ? "0" : platform.commission_earnings.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-500">
              <CreditCard size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">
            From {platform.total_completed_rides} completed rides
          </p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Driver Memberships */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Driver Memberships</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                Rs. {loading ? "0" : platform.subscription_earnings.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 rounded-xl text-purple-500">
              <Award size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">From active driver subscriptions</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Gross Bookings Volume */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Gross Fare Volume</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                Rs. {loading ? "0" : platform.total_gross_fare.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">Total completed fares value</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Filters & Table Container */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
        
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
            Drivers Payouts & Subscriptions
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Details of completed rides, gross fares, deducted commissions, and driver payouts
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-gray-50/50 dark:bg-slate-900/40">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver name, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-850 dark:text-slate-100 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Filters:</span>
            </div>

            {/* Subscription status filter */}
            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Plan</option>
              <option value="expired">Expired Plan</option>
              <option value="none">No Plan</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-yellow-400" />
              Loading earnings data...
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800">
              <Coins size={48} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
              <h4 className="font-bold text-slate-700 dark:text-slate-350 text-sm">No Earnings Records Found</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try resetting the search terms or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 font-bold text-xs uppercase">
                  <th className="py-4 px-6">Driver Details</th>
                  <th className="py-4 px-6 text-center">Completed Rides</th>
                  <th className="py-4 px-6">Gross Bookings</th>
                  <th className="py-4 px-6">Commission Deducted (20%)</th>
                  <th className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">Net Driver Payout (80%)</th>
                  <th className="py-4 px-6 text-right">Membership Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                {filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-slate-50/25 dark:hover:bg-slate-700/25 text-sm text-gray-700 dark:text-slate-350 transition-colors"
                  >
                    {/* Driver details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {driver.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                            📞 {driver.phone || "No phone"} • 🚗 {driver.vehicle_number || "No Vehicle"} ({driver.vehicle_type || "No Type"})
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Completed Rides */}
                    <td className="py-4 px-6 text-center font-medium text-slate-800 dark:text-slate-200">
                      {driver.completed_rides_count}
                    </td>

                    {/* Gross Bookings */}
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      Rs. {driver.gross_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Commission Deducted */}
                    <td className="py-4 px-6 text-rose-500 font-medium">
                      - Rs. {driver.commission_deducted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Net Payout */}
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">
                      Rs. {driver.net_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Membership plan */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold flex items-center w-max gap-1 capitalize ${
                            driver.subscription_status === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : driver.subscription_status === "expired"
                              ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            driver.subscription_status === "active" ? "bg-emerald-500" :
                            driver.subscription_status === "expired" ? "bg-rose-500" : "bg-slate-400"
                          }`} />
                          {driver.subscription_status === "active" ? "Active" : driver.subscription_status === "expired" ? "Expired" : "No Plan"}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          Rs. {(driver.subscription_amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
