import { useEffect, useState } from "react";
import { getVendorBookings, updateBookingStatus, type Booking } from "../../services/bookingService";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

const Bookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const vendorId = localStorage.getItem("vendorId");
        if (!vendorId) return;

        try {
            setLoading(true);
            const data = await getVendorBookings(vendorId);
            setBookings(data.bookings || []);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: "approved" | "rejected") => {
        try {
            await updateBookingStatus(bookingId, status);
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            console.log(error);
            toast.error(`Failed to update booking to ${status}`);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">All Bookings</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider">User</th>
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider">Venue</th>
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 font-semibold text-sm text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">Loading bookings...</td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">No bookings found.</td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-800">{booking.userId?.name || "Unknown"}</div>
                                        <div className="text-xs text-gray-500">{booking.userId?.email || ""}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-800">{booking.venueId?.name || "Venue"}</div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-800">
                                        ${booking.cost?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${booking.status === "approved" ? "bg-green-100 text-green-700" :
                                                booking.status === "rejected" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {booking.status === "approved" && <CheckCircle size={12} />}
                                            {booking.status === "rejected" && <XCircle size={12} />}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {booking.status === "approved" ? (
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, "rejected")}
                                                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-3 py-1.5 rounded transition-colors border border-red-200"
                                            >
                                                Reject
                                            </button>
                                        ) : booking.status === "rejected" ? (
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, "approved")}
                                                className="text-xs bg-green-50 text-green-600 hover:bg-green-100 font-semibold px-3 py-1.5 rounded transition-colors border border-green-200"
                                            >
                                                Approve
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bookings;
