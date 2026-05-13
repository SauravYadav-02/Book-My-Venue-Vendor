import { useEffect, useState, useCallback } from "react";
import {
  getVendorPaymentBookings,
  type VendorPaymentBooking,
} from "../../services/paymentService";
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
  IndianRupee,
  User,
  CalendarDays,
  Building2,
} from "lucide-react";
import { currencyFormatter } from "../../utils/currency";

// ── Status Badge ─────────────────────────────────────────────────────
const PaymentStatusBadge = ({
  status,
}: {
  status: "pending" | "success" | "failed";
}) => {
  const config = {
    success: {
      icon: <CheckCircle2 size={13} />,
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    failed: {
      icon: <XCircle size={13} />,
      label: "Failed",
      className: "bg-red-100 text-red-700 border border-red-200",
    },
    pending: {
      icon: <Clock size={13} />,
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
    },
  };
  const { icon, label, className } = config[status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${className}`}
    >
      {icon}
      {label}
    </span>
  );
};

// ── Summary Card ─────────────────────────────────────────────────────
const SummaryCard = ({
  icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-[#2d2d2d] mt-0.5 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────
const Bookings = () => {
  const [bookings, setBookings] = useState<VendorPaymentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "success" | "failed">(
    "all"
  );

  const fetchBookings = useCallback(async () => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      toast.error("Vendor not authenticated");
      return;
    }
    try {
      setLoading(true);
      const data = await getVendorPaymentBookings(vendorId);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      toast.error("Failed to load payment bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  // ── Derived stats ──────────────────────────────────────────────────
  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalCollected = bookings.reduce((s, b) => s + b.amountPaid, 0);
  const totalPending = bookings.reduce((s, b) => s + b.remainingAmount, 0);
  const paidCount = bookings.filter((b) => b.paymentStatus === "success").length;
  const failedCount = bookings.filter((b) => b.paymentStatus === "failed").length;
  const pendingCount = bookings.filter((b) => b.paymentStatus === "pending").length;

  // ── Filtered bookings ─────────────────────────────────────────────
  const filtered =
    filterStatus === "all" ? bookings : bookings.filter((b) => b.paymentStatus === filterStatus);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24" />
          ))}
        </div>
        <div className="bg-gray-100 rounded-2xl h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track bookings, upfront payments, and outstanding balances
          </p>
        </div>
        <button
          id="refresh-bookings-btn"
          onClick={fetchBookings}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#5C614D] border border-gray-200 hover:border-[#5C614D]/30 px-4 py-2 rounded-xl transition-all duration-200 bg-white shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<TrendingUp size={22} className="text-violet-600" />}
          iconBg="bg-violet-50"
          label="Total Revenue"
          value={currencyFormatter.format(totalRevenue)}
          sub={`${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
        />
        <SummaryCard
          icon={<Wallet size={22} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Collected (20%)"
          value={currencyFormatter.format(totalCollected)}
          sub={`${paidCount} paid`}
        />
        <SummaryCard
          icon={<IndianRupee size={22} className="text-amber-600" />}
          iconBg="bg-amber-50"
          label="Outstanding (80%)"
          value={currencyFormatter.format(totalPending)}
          sub="Due at events"
        />
        <SummaryCard
          icon={<AlertCircle size={22} className="text-red-500" />}
          iconBg="bg-red-50"
          label="Failed / Pending"
          value={`${failedCount + pendingCount}`}
          sub={`${pendingCount} pending · ${failedCount} failed`}
        />
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "success", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                id={`filter-${s}-btn`}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                  filterStatus === s
                    ? "bg-white text-[#5C614D] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "all" ? `All (${bookings.length})` :
                 s === "success" ? `Paid (${paidCount})` :
                 s === "pending" ? `Pending (${pendingCount})` :
                 `Failed (${failedCount})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ReceiptText size={14} />
            <span>Showing {filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">
                  Venue
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">
                  Total Amount
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">
                  Paid (20%)
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">
                  Remaining (80%)
                </th>
                <th className="py-3.5 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-center">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <ReceiptText size={36} className="opacity-40" />
                      <p className="text-sm font-medium">No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => {
                  const isPaid = booking.paymentStatus === "success";

                  return (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-gray-50/70 transition-colors duration-150 group"
                    >
                      {/* Customer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-violet-600 shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {booking.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-400">{booking.user?.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm font-medium text-gray-700">
                            {booking.venue?.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm">
                            {format(new Date(booking.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 text-right">
                        <span className="text-sm font-bold text-gray-800">
                          {currencyFormatter.format(booking.totalAmount)}
                        </span>
                      </td>

                      {/* Paid (20%) */}
                      <td className="py-4 px-5 text-right">
                        <span
                          className={`text-sm font-bold ${
                            isPaid ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {currencyFormatter.format(booking.amountPaid)}
                        </span>
                      </td>

                      {/* Remaining (80%) */}
                      <td className="py-4 px-5 text-right">
                        <span
                          className={`text-sm font-bold ${
                            booking.remainingAmount > 0 && isPaid
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        >
                          {currencyFormatter.format(booking.remainingAmount)}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <PaymentStatusBadge status={booking.paymentStatus} />
                          {booking.transactionId && isPaid && (
                            <span className="text-[10px] font-mono text-gray-400 hidden group-hover:block">
                              {booking.transactionId.slice(0, 18)}…
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

        {/* ── Table Footer ─────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
            <span className="text-xs text-gray-400">
              Totals across {filtered.length} visible booking{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-6 text-xs">
              <span className="text-gray-500">
                Total:{" "}
                <strong className="text-gray-800">
                  {currencyFormatter.format(filtered.reduce((s, b) => s + b.totalAmount, 0))}
                </strong>
              </span>
              <span className="text-emerald-600">
                Collected:{" "}
                <strong>
                  {currencyFormatter.format(filtered.reduce((s, b) => s + b.amountPaid, 0))}
                </strong>
              </span>
              <span className="text-amber-600">
                Outstanding:{" "}
                <strong>
                  {currencyFormatter.format(filtered.reduce((s, b) => s + b.remainingAmount, 0))}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
