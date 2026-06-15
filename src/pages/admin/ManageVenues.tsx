import { useEffect, useState, useCallback } from "react";
import { getAdminVenues, adminDeactivateVenue, adminReactivateVenue } from "../../services/adminVenueService";
import toast from "react-hot-toast";
import { Search, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface Venue {
  _id: string;
  name: string;
  vendorId: {
    fullName?: string;
    email?: string;
    businessName?: string;
  } | null;
  city?: string;
  status: "pending" | "approved" | "rejected";
  deactivated: boolean;
  deactivatedBy?: "admin" | "vendor" | null;
  deactivationReason?: string;
  suspensionEnd?: string;
}

export default function ManageVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalRecords: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivateStart, setDeactivateStart] = useState("");
  const [deactivateEnd, setDeactivateEnd] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const fetchVenues = useCallback(async (page = pagination.page, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await getAdminVenues({ page, limit: pagination.limit, search });
      setVenues(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchVenues(1, searchTerm);
  }, [searchTerm, fetchVenues]);

  useEffect(() => {
    fetchVenues(pagination.page, searchTerm);
  }, [pagination.page, fetchVenues]);

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      setDeactivating(true);
      const updated = await adminDeactivateVenue(
        deactivateId,
        deactivateReason,
        deactivateStart || undefined,
        deactivateEnd || undefined
      );
      setVenues((prev) => prev.map((v) => v._id === deactivateId ? { ...v, ...updated } : v));
      setDeactivateId(null);
      setDeactivateReason("");
      setDeactivateStart("");
      setDeactivateEnd("");
      toast.success("Venue deactivated successfully.");
      fetchVenues(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate venue.");
    } finally {
      setDeactivating(false);
    }
  };

  const handleReactivate = async (venueId: string) => {
    try {
      const updated = await adminReactivateVenue(venueId);
      setVenues((prev) => prev.map((v) => v._id === venueId ? { ...v, ...updated } : v));
      toast.success("Venue reactivated successfully.");
      fetchVenues(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reactivate venue.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">Rejected</span>;
      case "pending":
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    }
  };

  const getDeactivationBadge = (venue: Venue) => {
    if (!venue.deactivated) {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200">Active</span>;
    }
    if (venue.deactivatedBy === "admin") {
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Deactivated by Admin</span>
          {venue.suspensionEnd && (
            <span className="text-[10px] text-rose-500 font-semibold">Until: {new Date(venue.suspensionEnd).toLocaleDateString()}</span>
          )}
          {venue.deactivationReason && <span className="text-[10px] text-slate-400 italic">Reason: {venue.deactivationReason}</span>}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Suspended by Vendor</span>
        {venue.suspensionEnd && (
          <span className="text-[10px] text-slate-400 font-semibold">Until: {new Date(venue.suspensionEnd).toLocaleDateString()}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-50/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Venue Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Approve, suspend, or reactivate platform listings</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by venue name, city, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 shadow-sm"
          />
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Venue Name</th>
                  <th className="py-4 px-6">Vendor Name</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Approval Status</th>
                  <th className="py-4 px-6">Deactivation Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="text-xs text-slate-400">Loading listings...</span>
                      </div>
                    </td>
                  </tr>
                ) : venues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      No venues found.
                    </td>
                  </tr>
                ) : (
                  venues.map((venue) => (
                    <tr key={venue._id} className="hover:bg-slate-50/30">
                      <td className="py-4 px-6 font-bold text-slate-800">{venue.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{venue.vendorId?.fullName || "—"}</span>
                          {venue.vendorId?.email && <span className="text-[10px] text-slate-400">{venue.vendorId.email}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">{venue.city || "—"}</td>
                      <td className="py-4 px-6">{getStatusBadge(venue.status)}</td>
                      <td className="py-4 px-6">{getDeactivationBadge(venue)}</td>
                      <td className="py-4 px-6 text-center">
                        {venue.deactivated ? (
                          <button
                            onClick={() => handleReactivate(venue._id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all shadow-sm"
                          >
                            <ToggleRight size={16} />
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeactivateId(venue._id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all shadow-sm"
                          >
                            <ToggleLeft size={16} />
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold text-slate-600 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold text-slate-600 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Admin Deactivate Modal */}
      {deactivateId && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setDeactivateId(null);
            setDeactivateReason("");
            setDeactivateStart("");
            setDeactivateEnd("");
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-2">Deactivate Venue</h2>
            <p className="text-sm text-slate-400 mb-4">
              Specify a reason for deactivating this venue listing. This listing will be hidden from users.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Reason</label>
                <textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="e.g., Unresolved safety concerns, complaints..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={deactivateStart}
                    onChange={(e) => setDeactivateStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={deactivateEnd}
                    onChange={(e) => setDeactivateEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500 focus:ring-0"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * Note: Leaving dates blank deactivates the venue indefinitely.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeactivateId(null);
                  setDeactivateReason("");
                  setDeactivateStart("");
                  setDeactivateEnd("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deactivating ? "Deactivating..." : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
