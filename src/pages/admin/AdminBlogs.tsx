import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  AlertTriangle, 
  Trash2, 
  RotateCcw,
  BookOpen,
  User,
  Tag,
  Eye,
  X,
  MessageSquare,
  Heart
} from "lucide-react";
import { 
  getAdminBlogs, 
  approveBlog, 
  rejectBlog, 
  suspendBlog, 
  restoreBlog, 
  deleteBlogByAdmin, 
  undeleteBlogByAdmin,
  type Blog 
} from "../../services/blogService";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalRecords: 0,
    totalPages: 1
  });

  // Modal states for Rejection / Suspension
  const [actionBlog, setActionBlog] = useState<Blog | null>(null);
  const [actionType, setActionType] = useState<"reject" | "suspend" | null>(null);
  const [adminReason, setAdminReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // View Modal state
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  });

  const fetchBlogsData = useCallback(async (page = pagination.page, status = filterStatus, search = searchTerm, deleted = showDeleted) => {
    setLoading(true);
    try {
      const queryStatus = status === "all" ? "" : status;
      const res = await getAdminBlogs(page, pagination.limit, search, queryStatus, deleted);
      setBlogs(res.data || []);
      setPagination({
        page: res.page || 1,
        limit: res.limit || 6,
        totalRecords: res.totalRecords || 0,
        totalPages: res.totalPages || 1
      });
      
      // Fetch stats
      const statsRes = await getAdminBlogs(1, 1000, "", "", deleted);
      const allBlogs = statsRes.data || [];
      setStats({
        total: allBlogs.length,
        pending: allBlogs.filter(b => b.status === "pending").length,
        approved: allBlogs.filter(b => b.status === "approved").length,
        rejected: allBlogs.filter(b => b.status === "rejected").length,
        suspended: allBlogs.filter(b => b.status === "suspended").length
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchBlogsData(1, filterStatus, searchTerm, showDeleted);
  }, [filterStatus, searchTerm, showDeleted, fetchBlogsData]);

  const handleApprove = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to approve this blog? It will be published immediately on the user panel.")) {
      return;
    }
    try {
      await approveBlog(blogId);
      toast.success("Blog approved and published successfully!");
      fetchBlogsData(pagination.page, filterStatus, searchTerm, showDeleted);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve blog.");
    }
  };

  const handleOpenReasonModal = (blog: Blog, type: "reject" | "suspend") => {
    setActionBlog(blog);
    setActionType(type);
    setAdminReason("");
    setSubmittingAction(false);
  };

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionBlog || !actionType) return;
    if (!adminReason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    setSubmittingAction(true);
    try {
      if (actionType === "reject") {
        await rejectBlog(actionBlog._id, adminReason.trim());
        toast.success("Blog rejected successfully.");
      } else {
        await suspendBlog(actionBlog._id, adminReason.trim());
        toast.success("Blog suspended successfully.");
      }
      setActionBlog(null);
      setActionType(null);
      fetchBlogsData(pagination.page, filterStatus, searchTerm, showDeleted);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${actionType} blog.`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRestore = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to restore this blog back to pending status?")) {
      return;
    }
    try {
      await restoreBlog(blogId);
      toast.success("Blog status restored to pending.");
      fetchBlogsData(pagination.page, filterStatus, searchTerm, showDeleted);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore blog.");
    }
  };

  const handleSoftDelete = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to soft delete this blog? It will be hidden from the platform.")) {
      return;
    }
    try {
      await deleteBlogByAdmin(blogId);
      toast.success("Blog soft deleted successfully.");
      fetchBlogsData(pagination.page, filterStatus, searchTerm, showDeleted);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete blog.");
    }
  };

  const handleUndelete = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to restore/undelete this blog?")) {
      return;
    }
    try {
      await undeleteBlogByAdmin(blogId);
      toast.success("Blog undeleted successfully.");
      fetchBlogsData(pagination.page, filterStatus, searchTerm, showDeleted);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to undelete blog.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <AlertTriangle size={12} /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 p-1">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Moderate, review, and organize articles published by platform venue vendors.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Blogs</p>
          <p className="text-2xl font-bold text-gray-800 mt-1 font-serif">{stats.total}</p>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="text-xs font-bold text-amber-600/80 uppercase tracking-widest">Pending</p>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-serif">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest">Approved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-serif">{stats.approved}</p>
        </div>
        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="text-xs font-bold text-rose-600/80 uppercase tracking-widest">Rejected</p>
          <p className="text-2xl font-bold text-rose-700 mt-1 font-serif">{stats.rejected}</p>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md col-span-2 md:col-span-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suspended</p>
          <p className="text-2xl font-bold text-slate-700 mt-1 font-serif">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by title, tags, or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5C614D] focus:border-[#5C614D] bg-gray-50/40"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "pending", "approved", "rejected", "suspended"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                  filterStatus === s
                    ? "bg-white text-[#5C614D] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Toggle Deleted */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
              showDeleted 
                ? "bg-red-50 text-red-600 border-red-200" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {showDeleted ? "Showing Deleted" : "Show Deleted"}
          </button>
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-[#5C614D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-lg font-medium text-gray-500 font-serif">No blogs found</p>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the status filter, or checking for deleted posts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div 
              key={blog._id} 
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md relative ${
                blog.deleted ? "border-red-200 bg-red-50/5" : "border-gray-100"
              }`}
            >
              {/* Cover Image & Badges */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden group">
                {blog.coverImage ? (
                  <img 
                    src={blog.coverImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <BookOpen size={48} strokeWidth={1} />
                  </div>
                )}
                
                {/* Badges overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {getStatusBadge(blog.status)}
                  {blog.deleted && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                      Deleted
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col space-y-4">
                {/* Title & Author */}
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-gray-900 leading-snug line-clamp-2" title={blog.title}>
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User size={13} />
                    <span className="font-medium truncate max-w-[150px]">
                      {blog.vendorId?.fullName || "Unknown Vendor"}
                    </span>
                    {blog.vendorId?.businessName && (
                      <span className="text-gray-300 font-normal">|</span>
                    )}
                    {blog.vendorId?.businessName && (
                      <span className="text-[#5C614D] font-medium truncate max-w-[120px]">
                        {blog.vendorId.businessName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content snippet */}
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
                  {blog.content}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {blog.tags.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                        <Tag size={8} /> {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive stats (likes, comments) */}
                <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1">
                    <Heart size={14} className="text-rose-400 fill-rose-500/10" />
                    <span>{blog.likes?.length || 0} Likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-sky-400" />
                    <span>{blog.comments?.length || 0} Comments</span>
                  </div>
                  <div className="ml-auto text-[10px]">
                    {format(new Date(blog.createdAt), "MMM d, yyyy")}
                  </div>
                </div>

                {/* Admin Note if exists */}
                {blog.adminNote && (
                  <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-xs text-orange-800">
                    <p className="font-semibold flex items-center gap-1">
                      <AlertTriangle size={12} /> Admin Note:
                    </p>
                    <p className="mt-0.5 italic">{blog.adminNote}</p>
                  </div>
                )}

                {/* Action Buttons Panel */}
                <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setViewBlog(blog)}
                    className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold transition-all duration-200 border border-gray-200 cursor-pointer"
                  >
                    <Eye size={13} /> View
                  </button>

                  {!blog.deleted ? (
                    <>
                      {blog.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(blog._id)}
                            className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-all duration-200 border border-emerald-200 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReasonModal(blog, "reject")}
                            className="flex-1 min-w-[70px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-all duration-200 border border-rose-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {blog.status === "approved" && (
                        <button
                          onClick={() => handleOpenReasonModal(blog, "suspend")}
                          className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-all duration-200 border border-amber-200 cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}

                      {(blog.status === "rejected" || blog.status === "suspended") && (
                        <button
                          onClick={() => handleRestore(blog._id)}
                          className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition-all duration-200 border border-sky-200 cursor-pointer"
                        >
                          <RotateCcw size={12} /> Set Pending
                        </button>
                      )}

                      <button
                        onClick={() => handleSoftDelete(blog._id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 cursor-pointer"
                        title="Soft Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUndelete(blog._id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold transition-all duration-200 border border-gray-200 hover:border-emerald-200 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Undelete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchBlogsData(pagination.page - 1, filterStatus, searchTerm, showDeleted)}
            className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-gray-500 bg-gray-100/80 px-4 py-2 rounded-xl border border-gray-200/50">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchBlogsData(pagination.page + 1, filterStatus, searchTerm, showDeleted)}
            className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all duration-200 shadow-sm cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* REJECTION / SUSPENSION REASON MODAL */}
      {actionBlog && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setActionBlog(null); setActionType(null); }} />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 capitalize font-serif">
                {actionType} Blog Request
              </h3>
              <button 
                onClick={() => { setActionBlog(null); setActionType(null); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Please state the reason for {actionType}ing the blog post <span className="font-semibold text-gray-800">"{actionBlog.title}"</span>. This will be shown to the vendor.
            </p>

            <form onSubmit={handleReasonSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</label>
                <textarea
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder={`Reason for ${actionType}...`}
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#5C614D] focus:border-[#5C614D] bg-gray-50/50"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setActionBlog(null); setActionType(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#5C614D] hover:bg-[#4A4E3D] text-white text-xs font-semibold shadow-md transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  {submittingAction ? "Submitting..." : `Confirm ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED BLOG VIEW MODAL */}
      {viewBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setViewBlog(null)} />
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative z-10 border border-gray-100 space-y-6">
            
            {/* Header image & close */}
            <div className="relative h-60 w-full bg-gray-100 rounded-2xl overflow-hidden -mt-2">
              {viewBlog.coverImage ? (
                <img 
                  src={viewBlog.coverImage} 
                  alt={viewBlog.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <BookOpen size={64} strokeWidth={1} />
                </div>
              )}
              <button 
                onClick={() => setViewBlog(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md transition-all border-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="absolute top-4 left-4">
                {getStatusBadge(viewBlog.status)}
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                  {viewBlog.vendorId?.fullName?.charAt(0) || "V"}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">{viewBlog.vendorId?.fullName}</span>
                  {viewBlog.vendorId?.businessName && (
                    <span className="text-[#5C614D] font-medium ml-1">({viewBlog.vendorId.businessName})</span>
                  )}
                </div>
              </div>
              <div>Published: {format(new Date(viewBlog.createdAt), "MMMM d, yyyy h:mm a")}</div>
            </div>

            {/* Title & Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 font-serif leading-tight">
                {viewBlog.title}
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line font-light">
                {viewBlog.content}
              </div>
            </div>

            {/* Gallery images if any */}
            {viewBlog.images && viewBlog.images.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gallery Images</h4>
                <div className="grid grid-cols-3 gap-3">
                  {viewBlog.images.map((img, i) => (
                    <div key={i} className="h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Url if any */}
            {viewBlog.videoUrl && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attached Video Link</h4>
                <a 
                  href={viewBlog.videoUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C614D] hover:underline"
                >
                  Click here to watch: {viewBlog.videoUrl}
                </a>
              </div>
            )}

            {/* Tags */}
            {viewBlog.tags && viewBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {viewBlog.tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full text-xs font-medium bg-[#5C614D]/5 text-[#5C614D] border border-[#5C614D]/10">
                    <Tag size={10} /> {t}
                  </span>
                ))}
              </div>
            )}

            {/* Actions details */}
            <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
              <button
                onClick={() => setViewBlog(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-all border-none cursor-pointer"
              >
                Close View
              </button>
              
              {!viewBlog.deleted && viewBlog.status === "pending" && (
                <>
                  <button
                    onClick={() => { handleApprove(viewBlog._id); setViewBlog(null); }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all border-none cursor-pointer"
                  >
                    Approve Post
                  </button>
                  <button
                    onClick={() => { handleOpenReasonModal(viewBlog, "reject"); setViewBlog(null); }}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all border-none cursor-pointer"
                  >
                    Reject Post
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
