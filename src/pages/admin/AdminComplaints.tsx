import React, { useState, useEffect, useRef } from "react";
import {
  getComplaintsList,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  getAllVendorsAdmin,
  getComplaintMessages,
  sendComplaintMessage,
  type Complaint,
  type ComplaintMessage
} from "../../services/complaintService";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  ChevronDown,
  UserCheck,
  ArrowLeft
} from "lucide-react";

export default function AdminComplaints() {
  const adminId = localStorage.getItem("adminId") || "";
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // States
  const [listLoading, setListLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch complaints list on load
  const fetchComplaints = async (silent = false) => {
    if (!adminId) return;
    if (!silent) setListLoading(true);
    try {
      const data = await getComplaintsList({ adminid: adminId });
      setComplaints(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load complaints list");
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // Load all vendors for assignment dropdown
    if (adminId) {
      getAllVendorsAdmin(adminId)
        .then(setVendors)
        .catch(console.error);
    }
  }, [adminId]);

  // 2. Poll messages & status of the active complaint
  useEffect(() => {
    if (!selectedComplaint) {
      setMessages([]);
      return;
    }

    const pollData = async () => {
      try {
        const updatedComp = await getComplaintById(selectedComplaint._id, { adminid: adminId });
        setSelectedComplaint(prev => {
          if (prev && (prev.status !== updatedComp.status || prev.vendor?._id !== updatedComp.vendor?._id)) {
            fetchComplaints(true);
            return updatedComp;
          }
          return prev;
        });

        const msgs = await getComplaintMessages(selectedComplaint._id, { adminid: adminId });
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
      const msg = await sendComplaintMessage(selectedComplaint._id, { adminid: adminId }, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // 5. Update Status Override
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(selectedComplaint._id, { adminid: adminId }, newStatus);
      setSelectedComplaint(updated);
      toast.success(`Complaint status changed to ${newStatus}`);
      fetchComplaints(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to override status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 6. Assign/Reassign Vendor
  const handleAssignVendor = async (vendorVal: string) => {
    if (!selectedComplaint) return;
    setUpdatingAssignment(true);
    try {
      const updated = await assignComplaint(selectedComplaint._id, adminId, vendorVal);
      setSelectedComplaint(updated);
      toast.success(vendorVal ? "Vendor assigned successfully" : "Vendor unassigned");
      fetchComplaints(true);
    } catch (err: any) {
      toast.error("Failed to assign vendor");
    } finally {
      setUpdatingAssignment(false);
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

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === "All") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-stone-50/50 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-800 tracking-tight">Customer Complaints Administration</h1>
          <p className="text-sm text-stone-500 mt-1">Review all system support tickets, manage vendor assignments, override status lifecycles, and mediate discussions.</p>
        </div>

        {/* Status Quick Filter */}
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
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[450px]">

        {/* Complaints List Side */}
        <div className={`lg:col-span-4 border-r border-stone-200 flex flex-col h-full ${selectedComplaint ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-stone-100 bg-stone-50/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">All Ticket Logs ({filteredComplaints.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 max-h-[600px]">
            {listLoading ? (
              <div className="p-8 text-center text-stone-400 text-sm">Loading logs...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">No complaints found.</div>
            ) : (
              filteredComplaints.map(comp => (
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
                    <span>Vendor: {comp.vendor?.fullName || "Unassigned"}</span>
                    <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details & Thread Panel */}
        <div className={`lg:col-span-8 flex flex-col h-full ${!selectedComplaint ? "hidden lg:flex items-center justify-center bg-stone-50/20" : "flex"}`}>
          {selectedComplaint ? (
            <div className="flex flex-col h-full min-h-[450px]">

              {/* Mobile Back / Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/30">
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
                      Client: <span className="font-semibold">{selectedComplaint.user?.name}</span> • Ticket ID: {selectedComplaint._id}
                    </p>
                  </div>
                </div>

                {/* Status selector override */}
                <div className="relative inline-block">
                  <select
                    value={selectedComplaint.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-bold uppercase tracking-wider pl-3 pr-8 py-1.5 rounded-full border bg-white outline-none cursor-pointer appearance-none transition-all ${getStatusBadgeClass(selectedComplaint.status)}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Detail section user details, vendor assign dropdown, attachments */}
              <div className="p-4 bg-stone-50/50 border-b border-stone-250 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
                
                {/* Left: Client Description & Files */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Issue Details</h4>
                  <p className="text-stone-700 whitespace-pre-line leading-relaxed mb-3 text-sm">{selectedComplaint.description}</p>
                  
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
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

                {/* Right: Assignments and Client Contact */}
                <div className="border-t md:border-t-0 md:border-l border-stone-200 md:pl-4 space-y-3">
                  
                  {/* Vendor Assignment Select */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
                      <UserCheck size={12} />
                      Assign Vendor
                    </h4>
                    <select
                      value={selectedComplaint.vendor?._id || ""}
                      disabled={updatingAssignment}
                      onChange={(e) => handleAssignVendor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs outline-none focus:border-stone-450"
                    >
                      <option value="">-- Unassigned / Assign Vendor --</option>
                      {vendors.map(v => (
                        <option key={v._id} value={v._id}>{v.fullName} ({v.businessName || "No business name"})</option>
                      ))}
                    </select>
                  </div>

                  {/* Client Contacts */}
                  <div className="space-y-1 pt-1.5 border-t border-stone-100">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Client Profile</h4>
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-stone-400" />
                      <span className="font-semibold text-stone-850">{selectedComplaint.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-stone-400" />
                      <span>{selectedComplaint.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-stone-400" />
                      <span>{selectedComplaint.user?.phone}</span>
                    </div>
                  </div>

                  {/* Venue information */}
                  {selectedComplaint.venue && (
                    <div className="pt-1.5 border-t border-stone-100 flex items-center gap-1.5">
                      <Building2 size={13} className="text-stone-400" />
                      <span>Venue: <span className="font-semibold text-stone-800">{selectedComplaint.venue.name}</span></span>
                    </div>
                  )}
                </div>

              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[250px] bg-stone-50/20">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                    <MessageSquare size={32} className="mb-1 text-stone-300" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === adminId;
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isOwn
                            ? "bg-stone-800 text-white rounded-br-none"
                            : "bg-white border border-stone-200/70 text-stone-800 rounded-bl-none"
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOwn ? "text-stone-300" : "text-stone-400"}`}>
                              {isOwn ? "You" : msg.senderName} ({msg.senderModel})
                            </span>
                            <span className={`text-[9px] ${isOwn ? "text-stone-400" : "text-stone-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply field */}
              <div className="p-4 border-t border-stone-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Intervene in thread as Administrator..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-stone-850 hover:bg-stone-900 disabled:bg-stone-200 disabled:cursor-not-allowed text-white p-2.5 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </form>
                {selectedComplaint.status === "Closed" && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> Note: This complaint status is Closed, but Admin can still post responses.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-stone-400">
              <MessageSquare size={48} className="mx-auto mb-3 text-stone-300" />
              <p className="text-base font-serif italic">Select a support ticket</p>
              <p className="text-xs mt-1">Select a complaint from the logs to re-assign vendors, monitor chats, or force status updates.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
