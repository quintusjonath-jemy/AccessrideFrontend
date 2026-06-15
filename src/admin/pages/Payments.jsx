import axios from "axios";
import { useEffect, useState } from "react";
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Search, 
  RefreshCw, 
  X, 
  SlidersHorizontal, 
  ArrowUpRight, 
  Ban 
} from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_earnings: 0.00,
    total_pending: 0.00,
    success_rate: 100.0,
    total_transactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filtering
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [filterDriver, setFilterDriver] = useState("all");

  // Extract unique users and drivers from payments for filter options
  const uniqueUsers = Array.from(new Set(payments.map(p => p.user_name).filter(Boolean))).sort();
  const uniqueDrivers = Array.from(new Set(payments.map(p => p.driver_name).filter(Boolean))).sort();
  
  // Details Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fetch payments data
  const fetchPaymentsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await axios.get("http://localhost/admin/api/payments.php");
      if (res.data?.success) {
        setPayments(res.data.payments || []);
        setStats(res.data.stats || {
          total_earnings: 0.00,
          total_pending: 0.00,
          success_rate: 100.0,
          total_transactions: 0
        });
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  // Filter logic
  const filteredPayments = payments.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (p.user_name || "").toLowerCase().includes(searchLower) ||
      (p.driver_name || "").toLowerCase().includes(searchLower) ||
      String(p.ride_id).includes(searchLower) ||
      (p.transaction_id || "").toLowerCase().includes(searchLower);
      
    const matchesMethod = 
      filterMethod === "all" || 
      p.payment_method.toLowerCase() === filterMethod.toLowerCase();
      
    const matchesStatus = 
      filterStatus === "all" || 
      p.status.toLowerCase() === filterStatus.toLowerCase();

    const matchesUser = 
      filterUser === "all" || 
      p.user_name === filterUser;

    const matchesDriver = 
      filterDriver === "all" || 
      p.driver_name === filterDriver;
      
    return matchesSearch && matchesMethod && matchesStatus && matchesUser && matchesDriver;
  });

  // Update payment status
  const handleUpdateStatus = async (paymentId, newStatus) => {
    setUpdatingStatusId(paymentId);
    try {
      const res = await axios.put("http://localhost/admin/api/payments.php", {
        id: paymentId,
        status: newStatus
      });
      if (res.data?.success) {
        // Update local state
        setPayments(prev => 
          prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p)
        );
        // Refresh statistics
        fetchPaymentsData(true);
        if (selectedPayment && selectedPayment.id === paymentId) {
          setSelectedPayment(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(res.data?.message || "Failed to update payment status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating payment status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Status badges
  const statusColorClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "failed":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "refunded":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Payments & Earnings</h1>
          <p className="text-gray-500 mt-1">Manage system revenues, transactions, and driver payouts</p>
        </div>
        <button
          onClick={() => fetchPaymentsData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-5 py-2.5 rounded-xl font-semibold shadow-md hover:scale-105 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-slate-900 font-bold text-xs uppercase tracking-wider opacity-70">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-950 mt-2">Rs. {stats.total_earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2.5 bg-white/20 rounded-xl text-slate-950">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-[10px] text-slate-900 font-bold mt-auto z-10">
            <span className="bg-white/30 px-2 py-0.5 rounded-full">Completed payments</span>
          </div>
          {/* Subtle accent blob */}
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Pending Cash */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Pending Cash</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">Rs. {stats.total_pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-auto">To be collected by drivers</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Success Rate */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Success Rate</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{stats.success_rate}%</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-auto">Completed vs. failed transactions</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Transactions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Transactions</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">{stats.total_transactions}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
              <CreditCard size={18} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-auto">Overall payment records stored</p>
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-gray-50/50">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by User, Driver, Ride ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>
          
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">Filters:</span>
            </div>

            {/* User Filter */}
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            {/* Driver Filter */}
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              <option value="all">All Drivers</option>
              {uniqueDrivers.map((driver) => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
            
            {/* Method Filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-yellow-400" />
              Loading payments data...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center text-slate-400 bg-white">
              <CreditCard size={48} className="mx-auto mb-3 text-slate-200" />
              <h4 className="font-bold text-slate-700 text-sm">No Payments Found</h4>
              <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100 text-slate-400 font-bold text-xs uppercase">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Ride ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Driver</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/20 transition">
                    <td className="py-4 px-6 font-semibold text-slate-500">#{p.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">#{p.ride_id}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{p.user_name || "N/A"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700">{p.driver_name || "Unassigned"}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Rs. {p.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold flex items-center w-max gap-1 capitalize ${statusColorClass(p.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === "completed" ? "bg-emerald-500" :
                          p.status === "pending" ? "bg-amber-500" :
                          p.status === "failed" ? "bg-rose-500" : "bg-blue-500"
                        }`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      {p.created_at}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        Details
                        <ArrowUpRight size={12} />
                      </button>
                      
                      {p.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, "completed")}
                          disabled={updatingStatusId === p.id}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#0F172A] text-lg">Transaction Receipt</h3>
                <p className="text-xs text-gray-400 mt-0.5">Reference ID: {selectedPayment.transaction_id || "Cash Ride"}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setShowDetailsModal(false);
                }}
                className="p-2 bg-white hover:bg-gray-100 border border-gray-100 rounded-full text-slate-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Receipt Info */}
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50/50 border border-yellow-100 rounded-2xl text-center">
                <span className="text-xs text-yellow-800 font-bold bg-yellow-100 px-3 py-0.5 rounded-full uppercase tracking-wider">AccessRide</span>
                <span className="text-3xl font-black text-slate-800 mt-3">Rs. {selectedPayment.amount.toFixed(2)}</span>
                <span className="text-xs text-slate-400 mt-1">Method: {selectedPayment.payment_method.toUpperCase()}</span>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/50 p-3 border border-slate-100/50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Customer</span>
                  <span className="font-bold text-slate-700 mt-0.5 block">{selectedPayment.user_name || "N/A"}</span>
                  <span className="text-[9px] text-slate-400">ID: #{selectedPayment.user_id}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-slate-100/50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Driver Received</span>
                  <span className="font-bold text-slate-700 mt-0.5 block">{selectedPayment.driver_name || "Unassigned"}</span>
                  <span className="text-[9px] text-slate-400">ID: #{selectedPayment.driver_id || "N/A"}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-slate-100/50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Ride ID</span>
                  <span className="font-bold text-slate-700 mt-0.5 block">#{selectedPayment.ride_id}</span>
                </div>
                <div className="bg-slate-50/50 p-3 border border-slate-100/50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Transaction Date</span>
                  <span className="font-bold text-slate-700 mt-0.5 block text-xs">{selectedPayment.created_at}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">Current Status</span>
                  <span className="font-bold text-slate-700 uppercase text-xs mt-0.5 block">{selectedPayment.status}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold flex items-center gap-1 capitalize ${statusColorClass(selectedPayment.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedPayment.status === "completed" ? "bg-emerald-500" :
                    selectedPayment.status === "pending" ? "bg-amber-500" :
                    selectedPayment.status === "failed" ? "bg-rose-500" : "bg-blue-500"
                  }`} />
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-gray-100 flex gap-3">
              {selectedPayment.status === "pending" ? (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedPayment.id, "completed");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow transition text-center text-sm"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedPayment.id, "failed");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl transition text-center text-sm"
                  >
                    Mark Failed
                  </button>
                </>
              ) : selectedPayment.status === "completed" ? (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedPayment.id, "refunded");
                    setShowDetailsModal(false);
                  }}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold rounded-xl transition text-center text-sm flex items-center justify-center gap-2"
                >
                  <Ban size={14} />
                  Refund Transaction
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPayment(null);
                    setShowDetailsModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-center text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
