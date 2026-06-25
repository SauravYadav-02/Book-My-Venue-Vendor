import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000/complaints";

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendor?: {
    _id: string;
    fullName: string;
    businessName: string;
    email: string;
  };
  venue?: {
    _id: string;
    name: string;
    city: string;
  };
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Rejected";
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintMessage {
  _id: string;
  complaintId: string;
  senderId: string;
  senderModel: "User" | "Vendor" | "Admin";
  senderName: string;
  message: string;
  createdAt: string;
}

// 1. Get complaints list based on headers (Vendorid or Adminid)
export const getComplaintsList = async (headers: { vendorid?: string; adminid?: string }): Promise<Complaint[]> => {
  const res = await axios.get<any>(BASE_URL, { headers });
  return Array.isArray(res.data) ? res.data : (res.data.data || []);
};

// 2. Get single complaint details
export const getComplaintById = async (id: string, headers: { vendorid?: string; adminid?: string }): Promise<Complaint> => {
  const res = await axios.get<Complaint>(`${BASE_URL}/${id}`, { headers });
  return res.data;
};

// 3. Update complaint status
export const updateComplaintStatus = async (id: string, headers: { vendorid?: string; adminid?: string }, status: string): Promise<Complaint> => {
  const res = await axios.put<{ message: string; complaint: Complaint }>(`${BASE_URL}/${id}/status`, { status }, { headers });
  return res.data.complaint;
};

// 4. Assign complaint to vendor (Admin only)
export const assignComplaint = async (id: string, adminId: string, vendorId: string): Promise<Complaint> => {
  const res = await axios.put<{ message: string; complaint: Complaint }>(`${BASE_URL}/${id}/assign`, { vendorId }, {
    headers: { adminid: adminId }
  });
  return res.data.complaint;
};

// 4.5 Fetch all vendors (Admin only - for assignment list)
export const getAllVendorsAdmin = async (adminId: string): Promise<any[]> => {
  const res = await axios.get("http://192.168.1.12:3000/vendors", {
    headers: { adminid: adminId },
    params: { limit: 100 }
  });
  return res.data.data || [];
};

// 5. Get message thread
export const getComplaintMessages = async (id: string, headers: { vendorid?: string; adminid?: string }): Promise<ComplaintMessage[]> => {
  const res = await axios.get<ComplaintMessage[]>(`${BASE_URL}/${id}/messages`, { headers });
  return res.data;
};

// 6. Send message to thread
export const sendComplaintMessage = async (id: string, headers: { vendorid?: string; adminid?: string }, message: string): Promise<ComplaintMessage> => {
  const res = await axios.post<ComplaintMessage>(`${BASE_URL}/${id}/messages`, { message }, { headers });
  return res.data;
};
