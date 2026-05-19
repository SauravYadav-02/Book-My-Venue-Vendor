import axios from "axios";

// const API_URL = "http://localhost:3000";
const API_URL = "http://10.113.216.96:3000";

// --- Types ---
export interface Plan {
  _id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  features: string[];
}

export interface Subscription {
  _id: string;
  vendorId: string;
  planId: Plan | string;
  planSnapshot: {
    name: string;
    duration_days: number;
    price: number;
  };
  status: "active" | "grace" | "expired";
  startDate: string;
  endDate: string;
  graceEndDate: string;
  // ✅ New enriched fields from backend restructuring
  adminId?: string | null;
  adminName?: string;
  vendorName?: string;
  vendorEmail?: string;
  userName?: string;
  userEmail?: string;
}

export interface SubscriptionQueueItem {
  _id: string;
  planId: Plan;
  planSnapshot: { name: string; duration_days: number; price: number };
  position: number;
  isActivated: boolean;
  purchasedAt: string;
}

// --- Admin Services ---
export const getAllPlansAdmin = async (adminId: string, page = 1, limit = 10, search = "") => {
  const res = await axios.get(`${API_URL}/plans/all`, {
    headers: { adminid: adminId },
    params: { page, limit, search }
  });
  return res.data; // returns { success, data, page, limit, totalRecords, totalPages }
};

export const createPlan = async (adminId: string, data: Partial<Plan>) => {
  const res = await axios.post(`${API_URL}/plans`, data, {
    headers: { adminid: adminId },
  });
  return res.data.plan;
};

export const updatePlan = async (adminId: string, planId: string, data: Partial<Plan>) => {
  const res = await axios.put(`${API_URL}/plans/${planId}`, data, {
    headers: { adminid: adminId },
  });
  return res.data.plan;
};

export const deletePlan = async (adminId: string, planId: string) => {
  const res = await axios.delete(`${API_URL}/plans/${planId}`, {
    headers: { adminid: adminId },
  });
  return res.data;
};

// --- Vendor Services ---
export const getActivePlans = async () => {
  const res = await axios.get(`${API_URL}/plans`);
  return res.data.plans;
};

export const createPaymentIntent = async (vendorId: string, planId: string) => {
  const res = await axios.post(
    `${API_URL}/subscription/create-payment`,
    { planId },
    { headers: { vendorid: vendorId } }
  );
  return res.data;
};

export const confirmPayment = async (vendorId: string, transactionId: string) => {
  const res = await axios.post(
    `${API_URL}/subscription/confirm-payment`,
    { transactionId },
    { headers: { vendorid: vendorId } }
  );
  return res.data;
};

export const getCurrentSubscription = async (vendorId: string) => {
  const res = await axios.get(`${API_URL}/subscription`, {
    headers: { vendorid: vendorId },
  });
  return res.data.subscription;
};

export const getSubscriptionQueue = async (vendorId: string) => {
  const res = await axios.get(`${API_URL}/subscription/queue`, {
    headers: { vendorid: vendorId },
  });
  return res.data.queue;
};
