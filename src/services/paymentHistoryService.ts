import axios from "axios";

const BASE_URL = "http://localhost:3000";

// ── Types matching the backend PaymentHistoryModel ───────────────────────────

export interface PaymentHistoryEntry {
  _id: string;

  // Populated references
  vendorId: {
    _id: string;
    fullName: string;
    email: string;
    businessName?: string;
  } | string;
  userId?: {
    _id: string;
    name: string;
    username?: string;
    email: string;
    profilePhoto?: string | null;
    phone?: string;
  } | string | null;
  adminId?: {
    _id: string;
    username: string;
  } | string | null;

  // Flattened descriptive fields (stored directly on the record)
  vendorName: string;
  vendorEmail: string;
  userName: string;
  userEmail: string;
  adminName: string;

  type: "booking" | "subscription" | "full payment";
  relatedId: string;
  amount: number;
  paymentStatus: "pending" | "success" | "failed";
  transactionId: string | null;
  paymentTimestamp: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistoryEntry[];
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface PaymentHistoryFilters {
  type?: "booking" | "subscription" | "full payment";
  paymentStatus?: "pending" | "success" | "failed";
  startDate?: string;
  endDate?: string;
}

// ── Service Calls ─────────────────────────────────────────────────────────────

/**
 * GET /payments/vendor/:vendorId
 * Fetch payment history for a specific vendor (requires isVendor middleware on backend).
 */
export const getVendorPaymentHistory = async (
  vendorId: string,
  filters?: PaymentHistoryFilters
): Promise<PaymentHistoryEntry[]> => {
  const res = await axios.get<PaymentHistoryResponse>(
    `${BASE_URL}/payments/vendor/${vendorId}`,
    {
      headers: { vendorid: vendorId },
      params: filters,
    }
  );
  return res.data.data;
};

/**
 * GET /payments
 * Fetch all payment history (admin only).
 */
export const getAllPaymentHistory = async (
  filters?: PaymentHistoryFilters
): Promise<PaymentHistoryEntry[]> => {
  const res = await axios.get<PaymentHistoryResponse>(`${BASE_URL}/payments`, {
    params: filters,
  });
  return res.data.data;
};
