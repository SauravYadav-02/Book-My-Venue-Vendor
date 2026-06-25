import { useEffect, useState, useCallback } from "react";
import { getAdminBookings, processBookingRefund, type Booking } from "../../services/bookingService";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  User,
  CalendarDays,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { currencyFormatter } from "../../utils/currency";

export default function AdminBookings() {
  const adminId = localStorage.getItem("adminId") || "admin-mock-id";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "success" | "failed" | "cancelled">("all");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0
  });

  const fetchBookings = useCallback(
    async (page = pagination.page, status = filterStatus) => {
      setLoading(true);
      try {
        const queryStatus = status === "all" ? "" : status;
        const res = await getAdminBookings(adminId, page, pagination.limit, queryStatus);
        
        // Backend pagination returns { data: [], page, limit, totalRecords, totalPages }
        setBookings(res.data || []);
        setPagination({
          page: res.page || 1,
          limit: res.limit || 10,
          totalRecords: res.totalRecords || 0,
          totalPages: res.totalPages || 0
        });
      } catch (err: any) {
        console.error("Failed to load admin bookings:", err);
        toast.error("Failed to load bookings list.");
      } finally {
        setLoading(false);
      }
    },
    [adminId, pagination.limit, filterStatus]
  );

  useEffect(() => {
    fetchBookings(1, filterStatus);
  }, [filterStatus, fetchBookings]);

  const handleRefundProcess = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to mark this refund as processed? This will complete the mock refund payout.")) {
      return;
    }
    try {
      setRefundingId(bookingId);
      const result = await processBookingRefund(bookingId, adminId, "admin");
      if (result.success) {
        toast.success("Refund processed successfully!");
        fetchBookings(pagination.page, filterStatus);
        
        // Update selectedBooking modal view
        setSelectedBooking(prev => prev ? {
          ...prev,
          status: "cancelled",
          cancellation: { ...(prev as any).cancellation, refundStatus: "processed" }
        } as any : null);
      } else {
        toast.error(result.message || "Failed to process refund.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to process refund.");
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusBadge = (b: Booking) => {
    const s = b.status.toLowerCase();
    if (s === "cancelled") {
      const refundStatus = (b as any).cancellation?.refundStatus;
      if (refundStatus === "pending") {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock size={12} /> Refund Pending
          </span>
        );
      } else if (refundStatus === "processed") {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Refund Processed
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-50 text-stone-600 border border-stone-200">
            <XCircle size={12} className="text-stone-500" /> Cancelled
          </span>
        );
      }
    }

    switch (s) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> {b.status}
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const customerName = (b.userId as any)?.name || "";
    const customerEmail = (b.userId as any)?.email || "";
    const venueName = (b.venueId as any)?.name || "";
    const vendorName = (b.vendorId as any)?.fullName || "";

    return (
      customerName.toLowerCase().includes(term) ||
      customerEmail.toLowerCase().includes(term) ||
      venueName.toLowerCase().includes(term) ||
      vendorName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Platform Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of all customer bookings, payments, and cancellations across venues
          </p>
        </div>
        <button
          onClick={() => fetchBookings(pagination.page)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#5C614D] border border-gray-200 hover:border-[#5C614D]/30 px-4 py-2 rounded-xl transition-all duration-200 bg-white shadow-sm cursor-pointer"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start">
            {(["all", "success", "pending", "cancelled", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                  filterStatus === s
                    ? "bg-white text-[#5C614D] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "All Bookings" : s}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search customers, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5C614D] focus:border-[#5C614D] bg-gray-50/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#5C614D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No bookings found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Venue & Vendor</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Cost</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredBookings.map((b) => {
                  const cust = b.userId as any;
                  const ven = b.venueId as any;
                  const vend = b.vendorId as any;

                  return (
                    <tr
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-gray-50/70 cursor-pointer transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{cust?.name || "Customer"}</p>
                            <p className="text-xs text-gray-400">{cust?.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center gap-1">
                            <Building2 size={13} className="text-gray-400" /> {ven?.name || "Venue"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">Vendor: {vend?.fullName || "—"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <CalendarDays size={14} className="text-gray-400" />
                          {format(new Date(b.date), "dd/MM/yyyy")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-800">
                        {currencyFormatter.format(b.cost)}
                      </td>
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-2">
                          {getStatusBadge(b)}
                          {(b as any).cancellation?.refundStatus === "pending" && (
                            <button
                              onClick={() => handleRefundProcess(b._id)}
                              disabled={refundingId === b._id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] tracking-wider uppercase transition-colors shadow-sm cursor-pointer border-none flex items-center gap-1"
                            >
                              {refundingId === b._id ? (
                                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : null}
                              Process
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} bookings)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchBookings(pagination.page - 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBookings(pagination.page + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900">Platform Booking Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">Booking Date: {format(new Date(selectedBooking.date), "dd/MM/yyyy")}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-lg cursor-pointer border-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Customer</span>
                  <p className="font-semibold text-gray-800">{(selectedBooking.userId as any)?.name}</p>
                  <p className="text-xs text-gray-500">{(selectedBooking.userId as any)?.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Venue</span>
                  <p className="font-semibold text-gray-800">{(selectedBooking.venueId as any)?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Vendor</span>
                  <p className="font-semibold text-gray-800">{(selectedBooking.vendorId as any)?.fullName}</p>
                  <p className="text-xs text-gray-500">{(selectedBooking.vendorId as any)?.email}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-serif text-[#2d2d2d] font-bold text-base">Payment Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block mb-0.5">Amount Paid</span>
                    <span className="font-semibold text-stone-700">
                      {currencyFormatter.format((selectedBooking as any).amountPaid || 0)}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block mb-0.5">Remaining Amount</span>
                    <span className="font-semibold text-stone-700">
                      {currencyFormatter.format((selectedBooking as any).remainingAmount || 0)}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 block mb-0.5">Total Booking Cost</span>
                    <span className="font-bold text-stone-800">
                      {currencyFormatter.format((selectedBooking as any).finalAmount || selectedBooking.cost || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancellation & Refund Block */}
              {selectedBooking.status === "cancelled" && (selectedBooking as any).cancellation ? (
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                  <h4 className="font-serif text-[#2d2d2d] font-bold text-base flex items-center gap-2">
                    <AlertCircle size={18} className="text-stone-500" /> Cancellation Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400 block mb-0.5">Cancelled On</span>
                      <span className="font-semibold text-stone-700">
                        {(selectedBooking as any).cancellation.cancelledAt ? format(new Date((selectedBooking as any).cancellation.cancelledAt), "dd/MM/yyyy hh:mm a") : "—"}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400 block mb-0.5">Refund Tier</span>
                      <span className="font-semibold text-stone-700 capitalize">
                        {(selectedBooking as any).cancellation.refundTier || "none"}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400 block mb-0.5">Refund Amount</span>
                      <span className="font-bold text-emerald-600">
                        {currencyFormatter.format((selectedBooking as any).cancellation.refundAmount || 0)}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5 capitalize">
                        Process: {(selectedBooking as any).cancellation.refundStatus || "none"}
                      </span>
                    </div>
                  </div>
                  {(selectedBooking as any).cancellation.reason && (
                    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm text-sm">
                      <span className="text-xs text-gray-400 block mb-1">Reason for Cancellation</span>
                      <p className="text-stone-600 italic">"{(selectedBooking as any).cancellation.reason}"</p>
                    </div>
                  )}

                  {/* Refund action button */}
                  {(selectedBooking as any).cancellation.refundStatus === "pending" && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRefundProcess(selectedBooking._id)}
                        disabled={refundingId === selectedBooking._id}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md shadow-emerald-600/10 flex items-center gap-2 cursor-pointer border-none"
                      >
                        {refundingId === selectedBooking._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        Process Refund (Mock)
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
