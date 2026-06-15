import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { type Transaction } from "../../types/remainingPayment";
import { currencyFormatter } from "../../utils/currency";
import { Wallet, Receipt } from "lucide-react";

interface RemainingPaymentPanelProps {
  booking: {
    bookingId: string;
    finalAmount?: number;
    totalAmount?: number;
    cost?: number;
    amountPaid: number;
    remainingAmount: number;
    balancePaymentStatus?: "unpaid" | "partial" | "paid";
  };
  onSuccess?: () => void;
}

export const RemainingPaymentPanel: React.FC<RemainingPaymentPanelProps> = ({
  booking,
  onSuccess,
}) => {
  const [localBooking, setLocalBooking] = useState(booking);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Form states
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<"cash" | "cheque">("cash");
  const [note, setNote] = useState<string>("");

  const bookingId = booking.bookingId;
  const finalAmount = localBooking.finalAmount || localBooking.totalAmount || localBooking.cost || 0;
  const amountPaid = localBooking.amountPaid ?? 0;
  const remainingAmount = localBooking.remainingAmount !== undefined ? localBooking.remainingAmount : (finalAmount - amountPaid);
  const status = localBooking.balancePaymentStatus || (remainingAmount === 0 ? "paid" : amountPaid > 0 ? "partial" : "unpaid");

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const vendorId = localStorage.getItem("vendorId");
      const res = await axios.get(
        `http://localhost:3000/api/remaining-payment/vendor/booking/${bookingId}/transactions`,
        {
          headers: { vendorid: vendorId },
        }
      );
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err: any) {
      console.error("Failed to load transactions", err);
    } finally {
      setTransactionsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    setLocalBooking(booking);
    fetchTransactions();
  }, [booking, fetchTransactions]);

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    if (parsedAmount > remainingAmount) {
      toast.error(`Amount exceeds remaining balance of ₹${remainingAmount}`);
      return;
    }

    setLoading(true);
    try {
      const vendorId = localStorage.getItem("vendorId");
      const res = await axios.post(
        `http://localhost:3000/api/remaining-payment/vendor/log/${bookingId}`,
        { amount: parsedAmount, method, note },
        { headers: { vendorid: vendorId } }
      );

      if (res.data.success) {
        alert("Payment done successfully!");
        setAmount("");
        setNote("");
        
        const updated = res.data.booking;
        setLocalBooking({
          bookingId: updated._id,
          finalAmount: updated.finalAmount,
          totalAmount: updated.totalBookingAmount,
          amountPaid: updated.amountPaid,
          remainingAmount: updated.remainingAmount,
          balancePaymentStatus: updated.balancePaymentStatus,
        });

        fetchTransactions();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to log payment.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const statusBadges = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    unpaid: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 mt-4 p-1">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-stone-400 uppercase">Total Amount</span>
          <span className="text-xl font-bold text-stone-800 mt-2">
            {currencyFormatter.format(finalAmount)}
          </span>
        </div>
        <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Amount Paid</span>
          <span className="text-xl font-bold text-emerald-700 mt-2">
            {currencyFormatter.format(amountPaid)}
          </span>
        </div>
        <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">Remaining Balance</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadges[status]}`}>
              {status}
            </span>
          </div>
          <span className="text-xl font-bold text-amber-700 mt-2">
            {currencyFormatter.format(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Log Payment Form */}
      {remainingAmount > 0 && (
        <form onSubmit={handleLogPayment} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-800 flex items-center gap-2">
            <Wallet size={18} className="text-[#5C614D]" />
            Log Manual Payment (Cash / Cheque)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-500">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-[#5C614D] transition-colors"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-500">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: ₹${remainingAmount}`}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-[#5C614D] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-500">Note / Reference</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cheque no. / Cash details"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-[#5C614D] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#5C614D] hover:bg-[#4a4e3f] disabled:bg-stone-300 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            {loading ? "Logging Payment..." : "Log Payment"}
          </button>
        </form>
      )}

      {/* Transaction History Table */}
      <div className="space-y-3">
        <h4 className="font-serif text-base font-bold text-stone-800 flex items-center gap-2">
          <Receipt size={18} className="text-[#5C614D]" />
          Transaction History Log
        </h4>

        {transactionsLoading ? (
          <div className="text-center py-8 text-xs text-stone-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-400 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
            No transactions logged for this booking yet.
          </div>
        ) : (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-stone-50/40 text-stone-600">
                    <td className="py-3.5 px-4 font-medium text-xs">
                      {format(new Date(txn.paidAt), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {currencyFormatter.format(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          txn.method === "online"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : txn.method === "cash"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}
                      >
                        {txn.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {txn.loggedBy}
                    </td>
                    <td className="py-3.5 px-4 text-xs italic text-stone-500">
                      {txn.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
