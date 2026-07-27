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
import API_BASE from "../../config/api";

const Earnings = () => {
  const [platform, setPlatform] = useState({
    total_gross_fare: 0,
    commission_rate: 0,
    commission_earnings: 0,
    subscription_earnings: 0,
    active_sub_count: 0,
    total_earnings: 0,
    total_completed_rides: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [monthlyDriver, setMonthlyDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubscription, setFilterSubscription] = useState("all");

  const fetchEarningsData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    axios
      .get(`${API_BASE}/admin/api/earnings.php`)
      .then((res) => {
        if (res.data.success) {
          setPlatform(res.data.platform || {
            total_gross_fare: 0,
            commission_rate: 0,
            commission_earnings: 0,
            subscription_earnings: 0,
            active_sub_count: 0,
            total_earnings: 0,
            total_completed_rides: 0,
          });
          setDrivers(res.data.drivers || []);
          setMonthlyDriver(res.data.monthly_driver || null);
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

      {/* Driver of the Month Highlight Banner */}
      {!loading && monthlyDriver && (
        <div className="bg-gradient-to-r from-slate-900 via-[#0B2F89] to-slate-900 dark:from-[#0f172a] dark:via-[#1e3a8a] dark:to-[#0f172a] rounded-2xl p-6 shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 transition-all border border-blue-950/20">
          <div className="flex items-center gap-5 z-10">
            <div className="p-4 bg-white/10 rounded-2xl text-yellow-400 border border-white/10 shadow-inner shrink-0">
              <Award size={36} className="animate-bounce" />
            </div>
            <div>
              <span className="bg-yellow-400 text-slate-900 font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                Driver of the Month
              </span>
              <h2 className="text-2xl font-black mt-2 tracking-tight">{monthlyDriver.name}</h2>
              <p className="text-blue-200 text-xs mt-1 font-medium">
                Top rated and most active driver for this calendar month
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 z-10 shrink-0">
            <div className="text-center bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Monthly Rating</p>
              <p className="text-2xl font-black text-yellow-400 mt-0.5">⭐ {monthlyDriver.monthly_rating.toFixed(1)}</p>
            </div>
            <div className="text-center bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Trips Completed</p>
              <p className="text-2xl font-black text-yellow-400 mt-0.5">{monthlyDriver.completed_rides}</p>
            </div>
            <div className="text-center bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Contact</p>
              <p className="text-sm font-bold text-slate-100 mt-1">{monthlyDriver.phone}</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        </div>
      )}

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
            <span className="bg-white/30 px-2 py-0.5 rounded-full">Driver Membership Fees</span>
          </div>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Active Memberships */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Active Memberships</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                {loading ? "0" : (platform.active_sub_count || 0)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-500">
              <User size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">
            Drivers with active membership plans
          </p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Gross Bookings Volume */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Gross Booking Volume</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                Rs. {loading ? "0" : platform.total_gross_fare.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">Total completed ride fares value</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Completed Rides */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Completed Rides</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                {loading ? "0" : platform.total_completed_rides}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 rounded-xl text-purple-500">
              <Car size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-auto">Overall trips served by platform</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
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
            Details of completed rides, gross fares, and driver subscription plans
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
                  <th className="py-4 px-6 text-center">Monthly Rating</th>
                  <th className="py-4 px-6">Gross Bookings (100% Payout)</th>
                  <th className="py-4 px-6">Membership Fee</th>
                  <th className="py-4 px-6 text-right">Membership Status</th>
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

                    {/* Monthly Rating */}
                    <td className="py-4 px-6 text-center font-semibold text-amber-500 dark:text-amber-400">
                      {driver.monthly_rating > 0 ? (
                        <span className="flex items-center justify-center gap-0.5">
                          ⭐ {driver.monthly_rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">N/A</span>
                      )}
                    </td>

                    {/* Gross Bookings */}
                    <td className="py-4 px-6 font-bold text-slate-850 dark:text-slate-200">
                      Rs. {driver.gross_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Membership Fee */}
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Rs. {(driver.subscription_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Membership status */}
                    <td className="py-4 px-6 text-right">
                      {driver.subscription_status === "expired" && driver.warning_sent === 1 ? (
                        <span className="px-2.5 py-0.5 rounded-full border text-xs font-semibold flex items-center w-max ml-auto gap-1 bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Expired (Warning Sent)
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold flex items-center w-max ml-auto gap-1 capitalize ${
                            driver.subscription_status === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : driver.subscription_status === "expired"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            driver.subscription_status === "active" ? "bg-emerald-500" :
                            driver.subscription_status === "expired" ? "bg-rose-500" : "bg-slate-400"
                          }`} />
                          {driver.subscription_status === "active" ? "Active" : driver.subscription_status === "expired" ? "Expired" : "No Plan"}
                        </span>
                      )}
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
