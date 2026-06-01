import axios from "axios";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = "http://localhost:3000";

export interface VendorPaymentBooking {
  bookingId: string;
  user: {
    _id: string;
    name: string;
    username?: string;
    email: string;
  } | null;
  venue: {
    _id: string;
    name: string;
  } | null;
  date: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  upfrontPaymentAmount: number;
  paymentStatus: "pending" | "success" | "failed";
  transactionId: string | null;
  timestamp: string;
  bookingStatus: string;
}

export interface VendorBookingsResponse {
  bookings: VendorPaymentBooking[];
}

/**
 * Fetches all bookings for a vendor with full payment breakdown
 * from the mock payment route (GET /vendor/bookings?vendorId=...)
 */
export const getVendorPaymentBookings = async (
  vendorId: string
): Promise<VendorBookingsResponse> => {
  const res = await axios.get(`${BASE_URL}/vendor/bookings`, {
    params: { vendorId },
  });
  return res.data;
};
