import React, { useState, useEffect } from "react";
import {
  getReportsAdmin,
  getReportByIdAdmin,
  updateReportStatusAdmin,
  type Report
} from "../../services/reportService";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
  Search,
  CheckSquare
} from "lucide-react";

export default function AdminReports() {
  const adminId = localStorage.getItem("adminId") || "";
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Loading & Filtering States
  const [listLoading, setListLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch reports list
  const fetchReports = async (silent = false) => {
    if (!adminId) return;
    if (!silent) setListLoading(true);
    try {
      const data = await getReportsAdmin(adminId);
      setReports(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load reports list");
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [adminId]);

  // 2. Poll active report status details
  useEffect(() => {
    if (!selectedReport) return;

    const pollData = async () => {
      try {
        const updatedRep = await getReportByIdAdmin(adminId, selectedReport._id);
        setSelectedReport(prev => {
          if (prev && prev.status !== updatedRep.status) {
            fetchReports(true);
            return updatedRep;
          }
          return prev;
        });
      } catch (err) {
        console.error("Polling error for report:", err);
      }
    };

    pollData();
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, [selectedReport?._id]);

  // 3. Handle Status Update
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedReport) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateReportStatusAdmin(adminId, selectedReport._id, newStatus);
      setSelectedReport(updated);
      toast.success(`Report status changed to ${newStatus}`);
      fetchReports(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update report status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Closed":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // 4. Filtering logic
  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.venue?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-stone-50/50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-800 tracking-tight">Venue Reports Administration</h1>
          <p className="text-sm text-stone-500 mt-1">Review confidential platform reports, verify policy violations, and manage resolutions privately.</p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-4 py-2 border border-stone-250 rounded-xl bg-white focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[450px]">

        {/* Reports List Side */}
        <div className={`lg:col-span-4 border-r border-stone-200 flex flex-col h-full ${selectedReport ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-stone-100 bg-stone-50/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">All Private Reports ({filteredReports.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 max-h-[600px]">
            {listLoading ? (
              <div className="p-8 text-center text-stone-400 text-sm">Loading private reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">No venue reports found.</div>
            ) : (
              filteredReports.map(rep => (
                <div
                  key={rep._id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 cursor-pointer transition-all hover:bg-stone-50/80 ${selectedReport?._id === rep._id ? "bg-stone-50" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-stone-800 text-sm line-clamp-1">{rep.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClass(rep.status)}`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2">{rep.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span className="truncate max-w-[60%]">Venue: {rep.venue?.name}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`lg:col-span-8 flex flex-col h-full ${!selectedReport ? "hidden lg:flex items-center justify-center bg-stone-50/20" : "flex"}`}>
          {selectedReport ? (
            <div className="flex flex-col h-full min-h-[450px]">

              {/* Mobile Back / Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-serif text-stone-800 text-base sm:text-lg line-clamp-1">{selectedReport.title}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Client: <span className="font-semibold">{selectedReport.user?.name}</span> • Ticket ID: {selectedReport._id}
                    </p>
                  </div>
                </div>

                {/* Status selector override */}
                <div className="relative inline-block">
                  <select
                    value={selectedReport.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-bold uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-full border bg-white outline-none cursor-pointer appearance-none transition-all ${getStatusBadgeClass(selectedReport.status)}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Detail content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Description block */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Report Details</h4>
                  <p className="text-stone-700 whitespace-pre-line leading-relaxed text-sm bg-stone-50/30 p-4 rounded-xl border border-stone-100">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Info blocks: Venue details, Reporter details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                  
                  {/* Left: Venue & Vendor information */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                      <Building2 size={12} />
                      Targeted Venue Details
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-stone-200/60 space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Venue Name</p>
                        <p className="font-semibold text-stone-850">{selectedReport.venue?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">City Location</p>
                        <p className="text-stone-700">{selectedReport.venue?.city}</p>
                      </div>
                      {selectedReport.venue?.vendorId && (
                        <div className="pt-2 border-t border-stone-100 mt-2 space-y-1">
                          <p className="text-[10px] text-stone-400 font-bold uppercase">Owner Vendor Partner</p>
                          <p className="font-semibold text-stone-800">
                            {(selectedReport.venue.vendorId as any).fullName || (selectedReport.venue.vendorId as any).businessName}
                          </p>
                          <p className="text-stone-500">{(selectedReport.venue.vendorId as any).email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Reporter Profile */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                      <User size={12} />
                      Reporting User Profile
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-stone-200/60 space-y-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold">
                          {selectedReport.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-850">{selectedReport.user?.name}</p>
                          <p className="text-[10px] text-stone-400">Reporter account</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-stone-400" />
                          <span>{selectedReport.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-stone-400" />
                          <span>{selectedReport.user?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Attachments Section */}
                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-stone-200 bg-white hover:border-stone-400 px-3 py-1.5 rounded-lg text-stone-600 transition-colors shadow-sm text-xs font-semibold"
                        >
                          <FileText size={13} />
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lockout Notice */}
                <div className="pt-4">
                  <div className="bg-amber-50/50 border border-amber-200/60 text-amber-800 text-xs rounded-xl p-4 flex items-start gap-2.5">
                    <AlertCircle className="shrink-0 mt-0.5 text-amber-600" size={16} />
                    <div>
                      <p className="font-bold">Confidentiality Compliance</p>
                      <p className="mt-0.5">This ticket logging is completely invisible to the vendor dashboard. All updates, evaluations, and interventions regarding this report remain strictly confidential between the administration and the reporter.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-stone-400 my-auto">
              <CheckSquare size={48} className="mx-auto mb-3 text-stone-300" />
              <p className="text-base font-serif italic">Select a policy report</p>
              <p className="text-xs mt-1">Select a venue report from the sidebar list to inspect reporter details, contact venue owners privately, or toggle resolution states.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
