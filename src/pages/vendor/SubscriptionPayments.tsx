import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  getMySubscriptionPayments,
  type SubscriptionPaymentEntry,
  type SubscriptionPaymentPagination,
  type SubscriptionPaymentSummary,
} from "../../services/subscriptionPaymentService";
import { currencyFormatter } from "../../utils/currency";
import {
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ShieldCheck,
  ReceiptText,
  ChevronDown,
  Globe,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (v: string | null | undefined, fallback = "—") => {
  if (!v) return fallback;
  try { return format(new Date(v), "dd MMM yyyy"); } catch { return fallback; }
};

const fmtDateTime = (v: string | null | undefined, fallback = "—") => {
  if (!v) return fallback;
  try { return format(new Date(v), "dd MMM yyyy, hh:mm a"); } catch { return fallback; }
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: "pending" | "success" | "failed" }) => {
  const cfg = {
    success: {
      icon: <CheckCircle2 size={12} />,
      label: "Success",
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    failed: {
      icon: <XCircle size={12} />,
      label: "Failed",
      cls: "bg-red-50 text-red-700 border border-red-200",
    },
    pending: {
      icon: <Clock size={12} />,
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
    },
  };
  const { icon, label, cls } = cfg[status] ?? cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
      {icon}{label}
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const cfg: Record<string, string> = {
    subscription:   "bg-violet-50 text-violet-700 border border-violet-200",
    "full payment": "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cfg[type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {type}
    </span>
  );
};

const SummaryCard = ({
  icon, label, value, sub, gradient,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; gradient: string;
}) => (
  <div className={`rounded-2xl p-5 text-white shadow-md flex items-center gap-4 ${gradient}`}>
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SelectFilter = ({
  id, label, value, onChange, options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-gray-500 font-medium text-xs whitespace-nowrap">{label}:</span>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg pl-3 pr-7 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const DateInput = ({
  id, label, value, onChange, max,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; max?: string;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-gray-500 font-medium text-xs whitespace-nowrap">{label}:</span>
    <input
      id={id}
      type="date"
      value={value}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
    />
  </div>
);

const Pagination = ({
  pagination,
  onPageChange,
}: {
  pagination: SubscriptionPaymentPagination;
  onPageChange: (p: number) => void;
}) => {
  const { page, totalPages, hasNextPage, hasPrevPage, totalRecords, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, totalRecords);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
      <span className="text-xs text-gray-400">
        Showing <strong>{from}–{to}</strong> of <strong>{totalRecords}</strong> records
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          id="prev-page-btn"
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={15} />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              id={`page-btn-${p}`}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                p === page
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          id="next-page-btn"
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-violet-700 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SubscriptionPayments = () => {
  const vendorId = localStorage.getItem("vendorId") || "";

  // ── State ─────────────────────────────────────────────────────────────────
  const [entries, setEntries]       = useState<SubscriptionPaymentEntry[]>([]);
  const [pagination, setPagination] = useState<SubscriptionPaymentPagination | null>(null);
  const [summary, setSummary]       = useState<SubscriptionPaymentSummary | null>(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter]     = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");

  // Expanded row for transaction ID
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (targetPage = page, isRefresh = false) => {
      if (!vendorId) { toast.error("Vendor not authenticated"); return; }
      try {
        if (isRefresh) setLoading(true);
        const result = await getMySubscriptionPayments(vendorId, {
          page: targetPage,
          limit: 8,
          paymentStatus: statusFilter || undefined,
          type: typeFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setEntries(result.data);
        setPagination(result.pagination);
        setSummary(result.summary);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subscription payment history.");
      } finally {
        setLoading(false);
      }
    },
    [vendorId, page, statusFilter, typeFilter, startDate, endDate]
  );

  useEffect(() => { fetchData(1, true); setPage(1); }, [statusFilter, typeFilter, startDate, endDate]);
  useEffect(() => { fetchData(page); }, [page]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setStatusFilter(""); setTypeFilter(""); setStartDate(""); setEndDate("");
  };

  const hasFilters = statusFilter || typeFilter || startDate || endDate;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
        </div>
        <div className="h-96 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={24} className="text-violet-600" />
            Subscription Payments
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            View your subscription and full-payment billing history
          </p>
        </div>
        <button
          id="refresh-sub-payments-btn"
          onClick={() => fetchData(1, true)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-violet-600 border border-gray-200 hover:border-violet-300 px-4 py-2 rounded-xl transition-all bg-white shadow-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<TrendingUp size={20} className="text-white" />}
            gradient="bg-gradient-to-br from-violet-600 to-violet-800"
            label="Total Transactions"
            value={String(pagination?.totalRecords ?? 0)}
            sub="Subscriptions & add-ons"
          />
          <SummaryCard
            icon={<Wallet size={20} className="text-white" />}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            label="Amount Paid"
            value={currencyFormatter.format(summary.totalPaid)}
            sub={`${summary.countByStatus.success} successful`}
          />
          <SummaryCard
            icon={<Clock size={20} className="text-white" />}
            gradient="bg-gradient-to-br from-amber-400 to-amber-600"
            label="Pending"
            value={String(summary.countByStatus.pending)}
            sub="Awaiting confirmation"
          />
          <SummaryCard
            icon={<AlertCircle size={20} className="text-white" />}
            gradient="bg-gradient-to-br from-red-400 to-red-600"
            label="Failed"
            value={String(summary.countByStatus.failed)}
            sub="Unsuccessful payments"
          />
        </div>
      )}

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filters bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50/40">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Filter size={14} />
            <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
          </div>

          <SelectFilter
            id="status-filter"
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "All Statuses" },
              { value: "success", label: "Success" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />

          <SelectFilter
            id="type-filter"
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "", label: "All Types" },
              { value: "subscription", label: "Subscription" },
              { value: "full payment", label: "Full Payment" },
            ]}
          />

          <DateInput
            id="start-date-filter"
            label="From"
            value={startDate}
            onChange={setStartDate}
            max={endDate || undefined}
          />
          <DateInput
            id="end-date-filter"
            label="To"
            value={endDate}
            onChange={setEndDate}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              id="clear-filters-btn"
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline underline-offset-2 ml-1 transition-colors"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <ReceiptText size={13} />
            <span>{pagination?.totalRecords ?? 0} record{(pagination?.totalRecords ?? 0) !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Type", "Plan / Description", "Payment Date", "Billing Period", "Method", "Amount", "Status", "Transaction ID"].map((h) => (
                  <th key={h} className="py-3.5 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <ReceiptText size={40} className="opacity-40" />
                      <p className="text-sm font-medium text-gray-400">No subscription payment records found</p>
                      {hasFilters && (
                        <button onClick={clearFilters} className="text-xs text-violet-500 underline">
                          Clear filters to see all records
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isExpanded = expandedId === entry._id;
                  const hasFullTxn = entry.transactionId && entry.paymentStatus === "success";

                  return (
                    <tr
                      key={entry._id}
                      className="hover:bg-violet-50/30 transition-colors duration-150 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry._id)}
                    >
                      {/* Type */}
                      <td className="py-4 px-5">
                        <TypeBadge type={entry.type} />
                      </td>

                      {/* Plan / Description */}
                      <td className="py-4 px-5 max-w-[220px]">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {entry.description || "—"}
                        </p>
                      </td>

                      {/* Payment Date */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CalendarDays size={13} className="text-gray-400 shrink-0" />
                          <span>{fmtDateTime(entry.paymentDate, fmtDate(entry.createdAt))}</span>
                        </div>
                      </td>

                      {/* Billing Period */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {entry.billingPeriod?.startDate ? (
                          <div className="text-xs text-gray-500 font-medium">
                            <span className="text-gray-700">{fmtDate(entry.billingPeriod.startDate)}</span>
                            <span className="mx-1 text-gray-300">→</span>
                            <span className="text-gray-700">{fmtDate(entry.billingPeriod.endDate)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                          <Globe size={11} />
                          Online
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {currencyFormatter.format(entry.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={entry.paymentStatus} />
                      </td>

                      {/* Transaction ID */}
                      <td className="py-4 px-5">
                        {hasFullTxn ? (
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                            <span
                              className="font-mono text-[10px] text-gray-500 max-w-[120px] truncate"
                              title={entry.transactionId!}
                            >
                              {isExpanded ? entry.transactionId : `${entry.transactionId!.slice(0, 16)}…`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalRecords > 0 && (
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        )}
      </div>

    </div>
  );
};

export default SubscriptionPayments;
