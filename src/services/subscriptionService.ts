import axios from "axios";

// const API_URL = "http://localhost:3000";
const API_URL = "http://localhost:3000";

// --- Types ---
export interface Plan {
  _id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  features: string[];
  planType?: "base" | "addon" | "full payment";
  parentPlanId?: {
    _id: string;
    name: string;
    price: number;
    duration_days: number;
  } | string | null;
  maxVenues?: number;
  maxPhotos?: number;
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

export interface PlanLimits {
  maxVenues: number;
  maxPhotos: number;
  visibilityBoost: boolean;
  customBranding: boolean;
  supportTier: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  planLimits: PlanLimits;
}

export const getCurrentSubscription = async (vendorId: string): Promise<SubscriptionResponse> => {
  const res = await axios.get(`${API_URL}/subscription`, {
    headers: { vendorid: vendorId },
  });
  return res.data;
};

export const getSubscriptionQueue = async (vendorId: string) => {
  const res = await axios.get(`${API_URL}/subscription/queue`, {
    headers: { vendorid: vendorId },
  });
  return res.data.queue;
};

export interface AddonSubscription {
  _id: string;
  userId: string;
  addonId: Plan;
  baseSubscriptionId: any;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";
  startDate: string;
  expiryDate: string;
  suspensionReason?: string | null;
}

export const getMyAddons = async (vendorId: string): Promise<AddonSubscription[]> => {
  const res = await axios.get(`${API_URL}/subscription/addons`, {
    headers: { vendorid: vendorId },
  });
  return res.data.addons;
};

// ── NEW VENDOR SUBSCRIPTION SYSTEM ─────────────────────────────

export interface VendorPlan {
  _id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxVenues: number;
  visibilityBoost: boolean;
  customBranding: boolean;
  supportTier: "basic" | "priority";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorSubscription {
  _id: string;
  vendorId: string;
  planId: VendorPlan;
  cycle: "monthly" | "yearly";
  startDate: string;
  expiresAt: string;
  status: "active" | "grace" | "expired";
  paymentRef?: string;
}

export interface VendorSubscriptionStatusResponse {
  subscription: VendorSubscription | null;
  venueUsage: number;
  planLimits: PlanLimits;
}

export const getVendorPlans = async (): Promise<VendorPlan[]> => {
  const res = await axios.get(`${API_URL}/api/vendor/subscription/plans`);
  return res.data;
};

export const subscribeToPlan = async (
  vendorId: string,
  planId: string,
  cycle: "monthly" | "yearly",
  paymentRef?: string
): Promise<{ message: string; subscription: VendorSubscription }> => {
  const res = await axios.post(
    `${API_URL}/api/vendor/subscription/subscribe`,
    { planId, cycle, paymentRef },
    { headers: { vendorid: vendorId } }
  );
  return res.data;
};

export const getVendorSubscription = async (vendorId: string): Promise<VendorSubscriptionStatusResponse> => {
  const res = await axios.get(`${API_URL}/api/vendor/subscription`, {
    headers: { vendorid: vendorId },
  });
  return res.data;
};

