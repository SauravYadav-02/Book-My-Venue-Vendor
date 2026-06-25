import { useEffect, useState, useCallback } from "react";
import {
  getVendorPaymentHistory,
  type PaymentHistoryEntry,
  type PaymentHistoryFilters,
} from "../../services/paymentHistoryService";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Wallet,
  ReceiptText,
  AlertCircle,
  RefreshCw,
  User,
  CalendarDays,
  Filter,
  ChevronDown,
} from "lucide-react";
import { currencyFormatter } from "../../utils/currency";

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: "pending" | "success" | "failed" }) => {
  const cfg = {
    success: { icon: <CheckCircle2 size={13} />, label: "Success", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    failed:  { icon: <XCircle size={13} />,      label: "Failed",  cls: "bg-red-100 text-red-700 border border-red-200" },
    pending: { icon: <Clock size={13} />,         label: "Pending", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  };
  const { icon, label, cls } = cfg[status] ?? cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      {icon}{label}
    </span>
  );
};

// ── Type Badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type, isRefund }: { type: string; isRefund?: boolean }) => {
  const cfg: Record<string, string> = {
    "booking":      "bg-blue-100 text-blue-700",
    "subscription": "bg-purple-100 text-purple-700",
    "full payment": "bg-indigo-100 text-indigo-700",
    "refund":       "bg-rose-100 text-rose-700",
  };
  const displayType = isRefund ? "refund" : type;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${cfg[displayType] || "bg-gray-100 text-gray-600"}`}>
      {displayType}
    </span>
  );
};

// ── Summary Card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ icon, label, value, sub, iconBg }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; iconBg: string;
}) => (
  <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
    <div className="min-w-0 w-full">
      <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
      <p className="text-sm sm:text-base md:text-xl font-bold text-[#2d2d2d] mt-0.5 sm:mt-1 truncate" title={value}>{value}</p>
      {sub && <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const PaymentHistory = () => {
  const [entries, setEntries] = useState<PaymentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "subscription" | "full payment">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "success" | "failed">("all");

  const vendorId = localStorage.getItem("vendorId") || "";

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!vendorId) {
      toast.error("Vendor not authenticated");
      return;
    }
    try {
      if (isRefresh) setLoading(true);
      const filters: PaymentHistoryFilters = {};
      if (typeFilter !== "all") filters.type = typeFilter;
      if (statusFilter !== "all") filters.paymentStatus = statusFilter;
      const data = await getVendorPaymentHistory(vendorId, filters);
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch payment history", err);
      toast.error("Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  }, [vendorId, typeFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalAmount     = entries.reduce((s, e) => s + e.amount, 0);
  const successAmount   = entries.filter(e => e.paymentStatus === "success").reduce((s, e) => s + e.amount, 0);
  const successCount    = entries.filter(e => e.paymentStatus === "success").length;
  const pendingCount    = entries.filter(e => e.paymentStatus === "pending").length;
  const failedCount     = entries.filter(e => e.paymentStatus === "failed").length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-24" />)}
        </div>
        <div className="bg-gray-100 rounded-2xl h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Full transaction log — bookings, subscriptions, and admin payments
          </p>
        </div>
        <button
          id="refresh-history-btn"
          onClick={() => fetchHistory(true)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#5C614D] border border-gray-200 hover:border-[#5C614D]/30 px-4 py-2 rounded-xl transition-all duration-200 bg-white shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<TrendingUp className="text-violet-600 w-4 h-4 sm:w-[22px] sm:h-[22px]" />}
          iconBg="bg-violet-50"
          label="Total Transactions"
          value={String(entries.length)}
          sub={currencyFormatter.format(totalAmount) + " total"}
        />
        <SummaryCard
          icon={<Wallet className="text-emerald-600 w-4 h-4 sm:w-[22px] sm:h-[22px]" />}
          iconBg="bg-emerald-50"
          label="Collected"
          value={currencyFormatter.format(successAmount)}
          sub={`${successCount} successful`}
        />
        <SummaryCard
          icon={<Clock className="text-amber-600 w-4 h-4 sm:w-[22px] sm:h-[22px]" />}
          iconBg="bg-amber-50"
          label="Pending"
          value={String(pendingCount)}
          sub="Awaiting confirmation"
        />
        <SummaryCard
          icon={<AlertCircle className="text-red-500 w-4 h-4 sm:w-[22px] sm:h-[22px]" />}
          iconBg="bg-red-50"
          label="Failed"
          value={String(failedCount)}
          sub="Unsuccessful payments"
        />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-nowrap overflow-x-auto scrollbar-hide py-1">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium">Type:</span>
              <div className="relative">
                <select
                  id="type-filter"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="booking">Booking</option>
                  <option value="subscription">Subscription</option>
                  <option value="full payment">Full Payment</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <span className="text-gray-500 font-medium">Status:</span>
              <div className="relative">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap ml-auto sm:ml-0">
            <ReceiptText size={14} className="shrink-0" />
            <span>Showing {entries.length} record{entries.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Type</th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Party</th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Description</th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Amount</th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <ReceiptText size={36} className="opacity-40" />
                      <p className="text-sm font-medium">No payment records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const partyName = entry.userName || entry.adminName || entry.vendorName || "—";
                  const partyEmail = entry.userEmail || entry.vendorEmail || "—";
                  const displayDate = entry.paymentTimestamp
                    ? format(new Date(entry.paymentTimestamp), "dd/MM/yyyy")
                    : format(new Date(entry.createdAt), "dd/MM/yyyy");

                  return (
                    <tr key={entry._id} className="hover:bg-gray-50/70 transition-colors duration-150 group">
                      {/* Type */}
                      <td className="py-4 px-5">
                        <TypeBadge type={entry.type} isRefund={entry.description?.toLowerCase().includes("refund")} />
                      </td>

                      {/* Party */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{partyName}</p>
                            <p className="text-xs text-gray-400">{partyEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-5">
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {entry.description || "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm">{displayDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        {(() => {
                          const isRefund = entry.description?.toLowerCase().includes("refund");
                          return (
                            <span className={`text-sm font-bold ${isRefund ? "text-rose-600" : "text-gray-800"}`}>
                              {isRefund ? "-" : ""}{currencyFormatter.format(entry.amount)}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge status={entry.paymentStatus} />
                          {entry.transactionId && entry.paymentStatus === "success" && (
                            <span className="text-[10px] font-mono text-gray-400 hidden group-hover:block">
                              {entry.transactionId.slice(0, 18)}…
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
