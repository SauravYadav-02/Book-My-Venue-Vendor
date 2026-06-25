import React, { useState, useEffect, useRef } from "react";
import {
  getComplaintsList,
  getComplaintById,
  updateComplaintStatus,
  getComplaintMessages,
  sendComplaintMessage,
  type Complaint,
  type ComplaintMessage
} from "../../services/complaintService";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare,
  Send,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  ChevronDown,
  ArrowLeft,
  Building2
} from "lucide-react";

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export default function VendorComplaints() {
  const vendorId = localStorage.getItem("vendorId") || "";
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch complaints list on load
  const fetchComplaints = async (silent = false) => {
    if (!vendorId) return;
    if (!silent) setListLoading(true);
    try {
      const data = await getComplaintsList({ vendorid: vendorId });
      setComplaints(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load assigned complaints");
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [vendorId]);

  // 2. Poll messages & status of the active complaint
  useEffect(() => {
    if (!selectedComplaint) {
      setMessages([]);
      return;
    }

    const pollData = async () => {
      try {
        const updatedComp = await getComplaintById(selectedComplaint._id, { vendorid: vendorId });
        setSelectedComplaint(prev => {
          if (prev && prev.status !== updatedComp.status) {
            fetchComplaints(true);
            return updatedComp;
          }
          return prev;
        });

        const msgs = await getComplaintMessages(selectedComplaint._id, { vendorid: vendorId });
        setMessages(msgs);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollData();

    const interval = setInterval(pollData, 5000); // 5s interval
    return () => clearInterval(interval);
  }, [selectedComplaint?._id]);

  // 3. Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedComplaint) return;

    try {
      const msg = await sendComplaintMessage(selectedComplaint._id, { vendorid: vendorId }, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // 5. Update Status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(selectedComplaint._id, { vendorid: vendorId }, newStatus);
      setSelectedComplaint(updated);
      toast.success(`Complaint status updated to ${newStatus}`);
      fetchComplaints(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] bg-stone-50/50 p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
      <Toaster />

      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-serif text-stone-800 tracking-tight">Customer Complaints</h1>
        <p className="text-sm text-stone-500 mt-1">Review issues raised by users regarding your venues, reply, and track statuses.</p>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden min-h-0">

        {/* Complaints List Panel */}
        <div className={`lg:col-span-4 border-r border-stone-200 flex flex-col h-full max-h-full overflow-hidden ${selectedComplaint ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-stone-100 bg-stone-50/30 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Assigned Complaints</h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-stone-100 min-h-0">
            {listLoading ? (
              <div className="p-8 text-center text-stone-400 text-sm">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">No complaints assigned to you yet. Good job! 🎉</div>
            ) : (
              complaints.map(comp => (
                <div
                  key={comp._id}
                  onClick={() => setSelectedComplaint(comp)}
                  className={`p-4 cursor-pointer transition-all hover:bg-stone-50/80 ${selectedComplaint?._id === comp._id ? "bg-stone-50" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-stone-800 text-sm line-clamp-1">{comp.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClass(comp.status)}`}>
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2">{comp.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>Venue: {comp.venue?.name || "N/A"}</span>
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details & Thread Chat Panel */}
        <div className={`lg:col-span-8 flex flex-col h-full max-h-full overflow-hidden ${!selectedComplaint ? "hidden lg:flex items-center justify-center bg-stone-50/20" : "flex"}`}>
          {selectedComplaint ? (
            <div className="flex flex-col h-full max-h-full overflow-hidden">

              {/* Mobile Back / Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/30 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-serif text-stone-800 text-base sm:text-lg line-clamp-1">{selectedComplaint.title}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Raised by: <span className="font-semibold">{selectedComplaint.user?.name}</span> on {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status Dropdown selector */}
                <div className="relative inline-block">
                  <select
                    value={selectedComplaint.status}
                    disabled={updatingStatus || selectedComplaint.status === "Rejected"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-bold uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-full border bg-white outline-none cursor-pointer appearance-none transition-all ${getStatusBadgeClass(selectedComplaint.status)}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    {selectedComplaint.status === "Rejected" && (
                      <option value="Rejected" disabled>Rejected</option>
                    )}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Grid detail about user, venue, attachments */}
              <div className="p-4 bg-stone-50/50 border-b border-stone-250 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 shrink-0">
                {/* Left: Description */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Issue Details</h4>
                  <p className="text-stone-700 whitespace-pre-line leading-relaxed mb-3 text-sm">{selectedComplaint.description}</p>
                  
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedComplaint.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-stone-200 bg-white hover:border-stone-400 px-2.5 py-1 rounded-md text-stone-600 transition-colors shadow-sm"
                        >
                          <FileText size={12} />
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Contact Details */}
                <div className="border-t md:border-t-0 md:border-l border-stone-200 md:pl-4 flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Customer Details</h4>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-stone-400" />
                    <span className="font-semibold text-stone-800">{selectedComplaint.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-stone-400" />
                    <span>{selectedComplaint.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-stone-400" />
                    <span>{selectedComplaint.user?.phone}</span>
                  </div>
                  {selectedComplaint.venue && (
                    <div className="mt-2 p-2 bg-stone-100/80 rounded-lg flex items-center gap-2">
                      <Building2 size={13} className="text-stone-500" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-stone-450 font-bold">Targeted Venue</p>
                        <p className="font-semibold text-stone-850 text-[11px]">
                          {selectedComplaint.venue.name} ({selectedComplaint.venue.city})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments/Replies Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0 bg-stone-50/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                    <MessageSquare size={32} className="mb-1 text-stone-300" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === vendorId;
                    const isAdminMsg = msg.senderModel === "Admin";
                    
                    return (
                      <div key={msg._id} className={`flex items-start gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm ${
                          isOwn
                            ? "bg-[#4a5043] text-stone-150"
                            : isAdminMsg
                              ? "bg-amber-600 text-white font-bold"
                              : "bg-slate-200 text-slate-700"
                        }`}>
                          {getInitials(isOwn ? "You" : msg.senderName)}
                        </div>

                        {/* Message Bubble Column */}
                        <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                          {/* Sender name & time metadata */}
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-400">
                            {!isOwn ? (
                              <>
                                <span className="font-semibold text-stone-650">{msg.senderName}</span>
                                <span className={`px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider rounded-full border ${
                                  isAdminMsg 
                                    ? "bg-amber-50 text-amber-700 border-amber-255" 
                                    : "bg-stone-100 text-stone-600 border-stone-200"
                                }`}>
                                  {msg.senderModel}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-stone-650">You</span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Message Bubble itself */}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-line text-xs font-medium ${
                            isOwn
                              ? "bg-[#4a5043] text-white rounded-tr-none"
                              : isAdminMsg
                                ? "bg-amber-50/80 border border-amber-200/60 text-stone-900 rounded-tl-none"
                                : "bg-white border border-stone-200/70 text-stone-800 rounded-tl-none"
                          }`}>
                            <p className="leading-relaxed whitespace-pre-line text-xs font-medium">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer text reply input */}
              <div className="p-4 border-t border-stone-200 bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-stone-50/80 border border-stone-200 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-stone-450 focus-within:ring-1 focus-within:ring-stone-450/20 transition-all">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply to customer..."
                    disabled={selectedComplaint.status === "Closed" || selectedComplaint.status === "Rejected"}
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-stone-800 placeholder:text-stone-400 focus:ring-0 focus:outline-none min-w-0 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || selectedComplaint.status === "Closed" || selectedComplaint.status === "Rejected"}
                    className="bg-[#4a5043] hover:bg-[#3d4237] disabled:bg-stone-200 disabled:cursor-not-allowed text-white p-2.5 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    <Send size={14} className="translate-x-[0.5px] -translate-y-[0.5px]" />
                  </button>
                </form>
                {selectedComplaint.status === "Closed" && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> This complaint has been closed. Replying is disabled.
                  </p>
                )}
                {selectedComplaint.status === "Rejected" && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> This complaint has been rejected by Admin. Replying is disabled.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-stone-400">
              <MessageSquare size={48} className="mx-auto mb-3 text-stone-300" />
              <p className="text-base font-serif italic">No ticket selected</p>
              <p className="text-xs mt-1">Select a complaint from the sidebar list to view files, customer contacts, and replies.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
