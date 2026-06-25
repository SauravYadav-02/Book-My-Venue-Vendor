import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BillingPeriod {
  startDate: string | null;
  endDate: string | null;
}

export interface SubscriptionPaymentEntry {
  _id: string;
  type: "subscription" | "full payment";
  amount: number;
  paymentStatus: "pending" | "success" | "failed";
  transactionId: string | null;
  paymentMethod: "online";
  description: string;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  billingPeriod: BillingPeriod | null;
  adminId?: { _id: string; username: string } | null;
  adminName?: string;
  vendorName?: string;
  vendorEmail?: string;
}

export interface SubscriptionPaymentPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SubscriptionPaymentSummary {
  totalPaid: number;
  countByStatus: { pending: number; success: number; failed: number };
}

export interface SubscriptionPaymentFilters {
  paymentStatus?: "pending" | "success" | "failed" | null;
  type?: "subscription" | "full payment" | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SubscriptionPaymentResponse {
  success: boolean;
  data: SubscriptionPaymentEntry[];
  pagination: SubscriptionPaymentPagination;
  summary: SubscriptionPaymentSummary;
  filters: SubscriptionPaymentFilters;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * GET /payments/my/subscriptions
 * Fetches the logged-in vendor's subscription payment history.
 * Auth: vendorid header (from localStorage).
 */
export const getMySubscriptionPayments = async (
  vendorId: string,
  params: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<SubscriptionPaymentResponse> => {
  // Strip out empty / null values before sending
  const cleanParams: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      cleanParams[k] = v;
    }
  }

  const res = await axios.get<SubscriptionPaymentResponse>(
    `${BASE_URL}/payments/my/subscriptions`,
    {
      headers: { vendorid: vendorId },
      params: cleanParams,
    }
  );
  return res.data;
};
