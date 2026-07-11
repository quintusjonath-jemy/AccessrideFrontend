import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Users, Car, Route, CheckCircle2, XCircle, Clock,
  AlertTriangle, TrendingUp, DollarSign, FileText,
  Printer, ChevronDown, ShieldAlert, Battery, Navigation2,
  Truck, Star, Download
} from "lucide-react";
import { downloadReport } from "../components/ReportPDF";

const THIS_YEAR  = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const YEARS  = Array.from({ length: 5 }, (_, i) => THIS_YEAR - i);
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── small helpers ─────────────────────────────────────────────────────────────
const currency = (v) => `LKR ${Number(v).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
const pct = (v) => `${v}%`;

const SummaryCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`${color} rounded-2xl p-5 flex items-center gap-4 shadow`}>
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
      <Icon size={24} className="text-white" strokeWidth={1.8} />
    </div>
    <div>
      <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-white text-2xl font-extrabold leading-tight">{value}</p>
      {sub && <p className="text-white/70 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-100 dark:border-slate-700 overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-none print:mb-6">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
      <Icon size={18} className="text-blue-600 dark:text-blue-400" strokeWidth={2} />
      <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const StatRow = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-slate-700/40 last:border-0 ${highlight ? "font-bold text-blue-700 dark:text-blue-400" : ""}`}>
    <span className="text-gray-600 dark:text-slate-400 text-sm">{label}</span>
    <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{value}</span>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
const MonthlyReport = () => {
  const [selYear,  setSelYear]  = useState(THIS_YEAR);
  const [selMonth, setSelMonth] = useState(THIS_MONTH);
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const printRef = useRef();

  const fetchReport = () => {
    setLoading(true);
    setError("");
    axios.get(`http://localhost/admin/api/monthly_report.php?year=${selYear}&month=${selMonth}`)
      .then((res) => {
        if (res.data?.success) setData(res.data);
        else setError("Failed to load report data.");
      })
      .catch(() => setError("Could not reach the server. Make sure the backend is running."))
      .finally(() => setLoading(false));
  };

  const [downloading, setDownloading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // "success" | "error" | "info"
  const [emailDebug, setEmailDebug] = useState([]);

  useEffect(() => {
    axios.get("http://localhost/admin/api/admin.php")
      .then((res) => {
        if (res.data?.email) setEmail(res.data.email);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDownloadPDF = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await downloadReport(data);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = () => {
    if (!email) {
      setEmailMsg("Please enter a valid email address.");
      setEmailStatus("error");
      setEmailDebug([]);
      return;
    }
    setEmailSending(true);
    setEmailMsg("");
    setEmailStatus("");
    setEmailDebug([]);
    axios.post("http://localhost/admin/api/send_report_email.php", {
      email,
      year: selYear,
      month: selMonth
    })
      .then((res) => {
        if (res.data?.success) {
          setEmailMsg(res.data.message || "Report email sent!");
          setEmailStatus(res.data.mail_sent ? "success" : "info");
          setEmailDebug(res.data.debug || []);
        } else {
          setEmailMsg(res.data?.message || "Failed to send email.");
          setEmailStatus("error");
          setEmailDebug(res.data.debug || []);
        }
      })
      .catch(() => {
        setEmailMsg("Failed to reach email API.");
        setEmailStatus("error");
        setEmailDebug([]);
      })
      .finally(() => setEmailSending(false));
  };

  return (
    <div className="space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <FileText size={28} className="text-blue-600" />
            Monthly Report
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Generate and export a detailed monthly operational report for AccessRide
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year */}
          <select
            value={selYear}
            onChange={(e) => setSelYear(Number(e.target.value))}
            className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Month */}
          <select
            value={selMonth}
            onChange={(e) => setSelMonth(Number(e.target.value))}
            className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>

          {/* Generate */}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl shadow transition"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <TrendingUp size={16} />
            )}
            Generate Report
          </button>

          {/* Download PDF — only if data loaded */}
          {data && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-900 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl shadow transition"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* ── EMAIL REPORT BAR ── */}
      {!loading && data && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Send Report to Email</h4>
              <p className="text-xs text-gray-400 dark:text-slate-400">Mail a formatted HTML copy of this report directly to your inbox.</p>
            </div>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@accessride.com"
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button
              onClick={handleSendEmail}
              disabled={emailSending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shrink-0 flex items-center gap-2"
            >
              {emailSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send Email"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── EMAIL STATUS MESSAGE ── */}
      {emailMsg && (
        <div className={`p-5 rounded-2xl border text-sm font-medium transition-all ${
          emailStatus === "success" 
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400" 
            : emailStatus === "info"
            ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-750 dark:text-blue-400"
            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
        }`}>
          <div className="flex gap-2 items-start">
            <span className="text-base leading-none">
              {emailStatus === "success" ? "✓" : emailStatus === "info" ? "ℹ" : "⚠"}
            </span>
            <div className="flex-1 space-y-2">
              <p>{emailMsg}</p>
              {emailDebug && emailDebug.length > 0 && (
                <div className="mt-3 p-3 bg-black/5 dark:bg-black/25 rounded-xl text-xs font-mono max-h-48 overflow-y-auto space-y-1 border border-black/5">
                  <p className="font-bold border-b border-black/10 pb-1 mb-1 text-[10px] uppercase tracking-wider">SMTP Debug Diagnostics:</p>
                  {emailDebug.map((log, i) => (
                    <p key={i} className="opacity-85">{log}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 dark:text-slate-500 animate-pulse">Compiling report data…</p>
        </div>
      )}

      {/* ── REPORT CONTENT ── */}
      {!loading && data && (
        <div ref={printRef} className="space-y-8">

          {/* PRINT HEADER — only visible when printing */}
          <div className="hidden print:block mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900">
                  <span className="text-yellow-500">Access</span><span className="text-blue-900">Ride</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Blind Assistance Ride Service</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">Monthly Operational Report</p>
                <p className="text-gray-500 text-sm">{data.period.month_name} {data.period.year}</p>
                <p className="text-gray-400 text-xs mt-1">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ── SUMMARY BANNER ── */}
          <div className="print:mb-6">
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-3 font-semibold print:hidden">
              Summary — {data.period.month_name} {data.period.year}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard icon={Users}       label="New Users"       value={data.users.new}    sub={`${data.users.total} total`}   color="bg-gradient-to-br from-blue-500 to-blue-700" />
              <SummaryCard icon={Car}         label="New Drivers"     value={data.drivers.new}  sub={`${data.drivers.total} total`} color="bg-gradient-to-br from-amber-400 to-orange-500" />
              <SummaryCard icon={Route}       label="Total Rides"     value={data.rides.total}  sub={`${data.rides.completion_rate}% completion`} color="bg-gradient-to-br from-purple-500 to-purple-700" />
              <SummaryCard icon={DollarSign}  label="Revenue"         value={currency(data.revenue.total)} sub="Fares + Subscriptions" color="bg-gradient-to-br from-emerald-500 to-green-600" />
            </div>
          </div>

          {/* ── TWO-COLUMN GRID ── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* USERS */}
            <Section title="User Statistics" icon={Users}>
              <StatRow label="New Users Registered"  value={data.users.new} />
              <StatRow label="Total Users (Cumulative)" value={data.users.total} highlight />
            </Section>

            {/* DRIVERS */}
            <Section title="Driver Statistics" icon={Car}>
              <StatRow label="New Drivers Registered" value={data.drivers.new} />
              <StatRow label="Drivers Removed / Inactive" value={data.drivers.removed} />
              <StatRow label="Total Drivers (Cumulative)"  value={data.drivers.total} highlight />
            </Section>

            {/* RIDES BREAKDOWN */}
            <Section title="Ride Breakdown" icon={Route}>
              <StatRow label="Total Rides"       value={data.rides.total} />
              <StatRow label="✅ Completed"       value={`${data.rides.completed} (${data.rides.completion_rate}%)`} />
              <StatRow label="❌ Cancelled"       value={`${data.rides.cancelled} (${data.rides.cancellation_rate}%)`} />
              <StatRow label="⏳ Pending"         value={data.rides.pending} />
              <StatRow label="🟢 Active"          value={data.rides.active} />
              <StatRow label="Total Fare Collected" value={currency(data.rides.total_fare)} highlight />
            </Section>

            {/* REVENUE */}
            <Section title="Revenue & Earnings" icon={DollarSign}>
              <StatRow label="Ride Fare Revenue"      value={currency(data.revenue.ride_fare)} />
              <StatRow label="Subscription Revenue"   value={currency(data.revenue.subscriptions)} />
              <StatRow label="Total Revenue"          value={currency(data.revenue.total)} highlight />
            </Section>

          </div>

          {/* ── ALERTS SECTION (full width) ── */}
          <Section title="Alerts & Incidents" icon={AlertTriangle}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total",            value: data.alerts.total,            icon: ShieldAlert,   color: "text-gray-600    dark:text-slate-300"  },
                { label: "SOS",              value: data.alerts.sos,              icon: ShieldAlert,   color: "text-red-600     dark:text-red-400"     },
                { label: "Low Battery",      value: data.alerts.low_battery,      icon: Battery,       color: "text-yellow-600  dark:text-yellow-400"  },
                { label: "Navigation",       value: data.alerts.navigation,       icon: Navigation2,   color: "text-blue-600    dark:text-blue-400"    },
                { label: "Driver Emergency", value: data.alerts.driver_emergency, icon: Truck,         color: "text-orange-600  dark:text-orange-400"  },
                { label: "Resolved",         value: data.alerts.resolved,         icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                  <Icon size={22} className={color} strokeWidth={1.8} />
                  <p className="text-2xl font-extrabold text-gray-800 dark:text-slate-100">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── TOP DRIVERS ── */}
          <Section title="Top Performing Drivers" icon={Star}>
            {data.top_drivers.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-center py-4">No completed rides this month</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-slate-400 font-semibold">#</th>
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-slate-400 font-semibold">Driver</th>
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-slate-400 font-semibold">Phone</th>
                      <th className="text-right py-2 px-3 text-gray-500 dark:text-slate-400 font-semibold">Rides</th>
                      <th className="text-right py-2 px-3 text-gray-500 dark:text-slate-400 font-semibold">Earnings (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_drivers.map((d, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-slate-700/40 hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 px-3">
                          {i === 0 ? <span className="text-yellow-500 font-bold">🥇</span>
                           : i === 1 ? <span className="text-gray-400 font-bold">🥈</span>
                           : i === 2 ? <span className="text-orange-500 font-bold">🥉</span>
                           : <span className="text-gray-400 text-xs font-semibold pl-1">{i + 1}</span>}
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-800 dark:text-slate-200">{d.name || "—"}</td>
                        <td className="py-3 px-3 text-gray-500 dark:text-slate-400">{d.phone || "—"}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full text-xs">
                            {d.rides_completed}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                          {d.earnings.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* PRINT FOOTER */}
          <div className="hidden print:block mt-10 pt-4 border-t border-gray-300 text-xs text-gray-400 flex justify-between">
            <span>AccessRide — Confidential Monthly Report · {data.period.month_name} {data.period.year}</span>
            <span>Generated by AccessRide Admin Panel</span>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !data && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText size={36} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-slate-300">No Report Generated</h3>
          <p className="text-gray-400 dark:text-slate-500 max-w-sm">
            Select a year and month above, then click <strong>Generate Report</strong> to compile the full operational summary.
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;
