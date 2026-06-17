import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { 
  Heart, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  X, 
  Plus, 
  Calendar, 
  Image as ImageIcon,
  Film,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { 
  getMyBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  type Blog 
} from "../../services/blogService";

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  } | null>(null);

  // Modals & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTagsStr, setFormTagsStr] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  
  // Cover Image State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Extra Images State
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch blogs data
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBlogs(page, 9);
      setBlogs(res.data || []);
      setPagination({
        page: res.page,
        limit: res.limit,
        totalRecords: res.totalRecords,
        totalPages: res.totalPages
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to load your blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormTitle("");
    setFormContent("");
    setFormTagsStr("");
    setFormVideoUrl("");
    setCoverFile(null);
    setCoverPreview(null);
    setExtraFiles([]);
    setExtraPreviews([]);
    setExistingImages([]);
    setError("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormContent(blog.content);
    setFormTagsStr(blog.tags ? blog.tags.join(", ") : "");
    setFormVideoUrl(blog.videoUrl || "");
    setCoverFile(null);
    setCoverPreview(blog.coverImage || null);
    setExtraFiles([]);
    setExtraPreviews([]);
    setExistingImages(blog.images || []);
    setError("");
    setShowModal(true);
  };

  // Cover Image change handler
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Cover image exceeds 5MB size limit!");
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Extra Images change handler
  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      const validFiles: File[] = [];
      const previewsArr: string[] = [];

      // Check current files length + new files length
      const currentLength = extraFiles.length + existingImages.length;
      if (currentLength + filesArr.length > 5) {
        toast.error("You can upload a maximum of 5 additional images!");
        return;
      }

      filesArr.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB size limit!`);
          return;
        }
        validFiles.push(file);
        previewsArr.push(URL.createObjectURL(file));
      });

      setExtraFiles(prev => [...prev, ...validFiles]);
      setExtraPreviews(prev => [...prev, ...previewsArr]);
    }
  };

  // Remove fresh uploaded extra image
  const removeExtraPreview = (index: number) => {
    setExtraFiles(prev => prev.filter((_, i) => i !== index));
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image (stored in DB)
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formTitle.trim() || !formContent.trim()) {
      setError("Title and Content are required fields.");
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("content", formContent.trim());
      formData.append("videoUrl", formVideoUrl.trim());

      // Parse tags
      const tagsArray = formTagsStr
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));

      // Append coverImage if new file is selected
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      // Append new extra images
      extraFiles.forEach(file => {
        formData.append("images", file);
      });

      // If editing, append remaining existing images to preserve them
      if (editingBlog) {
        formData.append("existingImages", JSON.stringify(existingImages));
        await updateBlog(editingBlog._id, formData);
        toast.success("Blog updated successfully and submitted for review!");
      } else {
        await createBlog(formData);
        toast.success("Blog submitted for review!");
      }

      setShowModal(false);
      fetchBlogs();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save blog post.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Blog handler
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteBlog(deleteId);
      toast.success("Blog deleted successfully.");
      setDeleteId(null);
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete blog.");
    } finally {
      setDeleting(false);
    }
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status: Blog["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-50/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Panel */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Blogs</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {pagination?.totalRecords || 0} post{(pagination?.totalRecords !== 1) ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Write New Blog
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <BookOpen size={28} />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg">No blogs yet</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">Write your first blog post to connect with users and share insights!</p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              Write New Blog
            </button>
          </div>
        ) : (
          /* Blog Grid */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <div key={blog._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  
                  {/* Blog Image Container */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    {blog.coverImage ? (
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 font-serif font-bold italic text-lg select-none">
                        Book My Venue Blog
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getStatusBadge(blog.status)}`}>
                      {blog.status === "pending" ? "Under Review" : blog.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2 className="font-bold text-slate-800 text-base line-clamp-2" title={blog.title}>
                        {blog.title}
                      </h2>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                        {blog.content}
                      </p>
                    </div>

                    {/* Admin Rejection/Suspension Warning Note */}
                    {blog.adminNote && (blog.status === "rejected" || blog.status === "suspended") && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2">
                        <AlertCircle className="shrink-0 mt-0.5 text-rose-600" size={14} />
                        <div>
                          <span className="font-bold">Admin Note:</span> {blog.adminNote}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Stats & Actions Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="text-rose-500" />
                          {blog.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} className="text-slate-400" />
                          {blog.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1 ml-1">
                          <Calendar size={12} />
                          {format(new Date(blog.createdAt), "dd MMM yyyy")}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Blog"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(blog._id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Blog"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400 font-semibold px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==========================================
          WRITE / EDIT BLOG MODAL (large overlay)
          ========================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800 font-serif">
                {editingBlog ? "Edit Blog Post" : "Write New Blog"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              
              {/* Error Alert */}
              {error && (
                <div className="bg-rose-50 border border-rose-150 text-rose-700 rounded-xl px-4 py-3 text-xs">
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Blog Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Give your post a catchy title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Content *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Write your story, tips, or insights here..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none min-h-48"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Tags</label>
                <input
                  type="text"
                  placeholder="e.g. decor, catering, photography, summer"
                  value={formTagsStr}
                  onChange={(e) => setFormTagsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
                <span className="text-[10px] text-slate-400 italic">Separate tags with commas</span>
              </div>

              {/* Video URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <Film size={12} /> Video URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="YouTube or Vimeo video link"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <ImageIcon size={12} /> Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-650 transition-all select-none">
                    Upload Cover
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">JPEG, PNG, WEBP (Max 5MB)</span>
                </div>

                {/* Cover Image Preview */}
                {coverPreview && (
                  <div className="mt-2 relative w-48 aspect-video rounded-xl border border-slate-150 overflow-hidden bg-slate-50">
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer border-none flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <ImageIcon size={12} /> Additional Images (Max 5)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-650 transition-all select-none">
                    Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleExtraImagesChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">Select up to 5 additional images</span>
                </div>

                {/* Images Previews Grid (Existing + Fresh Uploaded) */}
                {(existingImages.length > 0 || extraPreviews.length > 0) && (
                  <div className="grid grid-cols-5 gap-2.5 mt-2">
                    {/* Existing Images (stored on DB) */}
                    {existingImages.map((imgUrl, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg border border-slate-150 overflow-hidden bg-slate-50">
                        <img src={imgUrl} alt="Existing Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer border-none flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    {/* Freshly uploaded extra images */}
                    {extraPreviews.map((previewUrl, idx) => (
                      <div key={`fresh-${idx}`} className="relative aspect-square rounded-lg border border-slate-150 overflow-hidden bg-slate-50">
                        <img src={previewUrl} alt="Fresh Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExtraPreview(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer border-none flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 bg-white">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-grow bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer border-none"
                >
                  {submitLoading ? "Saving..." : (editingBlog ? "Save Changes" : "Publish Blog")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
          ========================================== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-6">
            
            {/* Warning Icon Container */}
            <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
              <Trash2 size={22} />
            </div>

            {/* Warning Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this blog post? This action is irreversible.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md shadow-rose-600/10 cursor-pointer border-none"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
