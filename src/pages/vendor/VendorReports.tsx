import { useState, useEffect } from "react";
import { getReportsVendor, type Report } from "../../services/reportService";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  ArrowLeft,
  Search,
  CheckSquare
} from "lucide-react";

export default function VendorReports() {
  const vendorId = localStorage.getItem("vendorId") || "";
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Loading & Filtering States
  const [listLoading, setListLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch reports list for this vendor
  const fetchReports = async (silent = false) => {
    if (!vendorId) return;
    if (!silent) setListLoading(true);
    try {
      const data = await getReportsVendor(vendorId);
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
  }, [vendorId]);

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

  // Filtering logic
  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.venue?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Venue Policy Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor complaints, user reports, and administrative decisions concerning your venues.</p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden min-h-[450px]">

        {/* Reports List Side */}
        <div className={`lg:col-span-4 border-r border-gray-200 flex flex-col h-full ${selectedReport ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-150 bg-gray-50/50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Reports Filed against You ({filteredReports.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[600px] scrollbar-thin">
            {listLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading reports list...</div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No venue reports found.</div>
            ) : (
              filteredReports.map(rep => (
                <div
                  key={rep._id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50/50 ${selectedReport?._id === rep._id ? "bg-gray-50/80" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{rep.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClass(rep.status)}`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{rep.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="truncate max-w-[60%]">Venue: {rep.venue?.name}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className={`lg:col-span-8 flex flex-col h-full ${!selectedReport ? "hidden lg:flex items-center justify-center bg-gray-50/20" : "flex"}`}>
          {selectedReport ? (
            <div className="flex flex-col h-full min-h-[450px]">

              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-650 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1">{selectedReport.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Target Venue: <span className="font-semibold text-gray-700">{selectedReport.venue?.name}</span> • Ticket ID: {selectedReport._id}
                    </p>
                  </div>
                </div>

                {/* Status indicator (Read-Only) */}
                <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${getStatusBadgeClass(selectedReport.status)}`}>
                  Status: {selectedReport.status}
                </span>
              </div>

              {/* Detail content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Description block */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Report Description</h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Info blocks: Venue details, Reporter details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-150">
                  
                  {/* Left: Venue information */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                      <Building2 size={12} />
                      Targeted Venue
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Venue Name</p>
                        <p className="font-semibold text-gray-800">{selectedReport.venue?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Location</p>
                        <p className="text-gray-700">{selectedReport.venue?.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Reporter Profile */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                      <User size={12} />
                      Reporter Profile
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200/60 space-y-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-650 font-bold">
                          {selectedReport.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{selectedReport.user?.name}</p>
                          <p className="text-[10px] text-gray-400">Reporter account</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-gray-400" />
                          <span>{selectedReport.user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-400" />
                          <span>{selectedReport.user?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Attachments Section */}
                {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                  <div className="pt-4 border-t border-gray-150 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-gray-200 bg-white hover:border-gray-400 px-3 py-1.5 rounded-lg text-gray-600 transition-colors shadow-sm text-xs font-semibold"
                        >
                          <FileText size={13} />
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Notice */}
                <div className="pt-4">
                  <div className="bg-indigo-50/50 border border-indigo-200/60 text-indigo-800 text-xs rounded-xl p-4 flex items-start gap-2.5">
                    <AlertCircle className="shrink-0 mt-0.5 text-indigo-600" size={16} />
                    <div>
                      <p className="font-bold">Policy & Compliance</p>
                      <p className="mt-0.5">Please review this report details thoroughly. If you believe this report is in error or needs clarification, please open a communication ticket in the **Complaints** section or contact platform administrators directly.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-gray-450 my-auto">
              <CheckSquare size={48} className="mx-auto mb-3 text-gray-350" />
              <p className="text-base font-serif italic">Select a policy report</p>
              <p className="text-xs mt-1">Select a venue report from the sidebar list to inspect details, user reviews, or attached proof files.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
