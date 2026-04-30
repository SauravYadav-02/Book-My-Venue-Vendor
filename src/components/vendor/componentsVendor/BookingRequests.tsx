

import { useEffect, useState } from "react";
import { getVendorBookings, updateBookingStatus, type Booking } from "../../../services/bookingService";
import toast from "react-hot-toast";

const BookingRequests = () => {
    const [requests, setRequests] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const vendorId = localStorage.getItem("vendorId");
        if (!vendorId) return;

        try {
            const data = await getVendorBookings(vendorId);
            setRequests(data.bookings || []);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (bookingId: string) => {
        try {
            await updateBookingStatus(bookingId, "rejected");
            toast.success("Booking rejected");
            fetchBookings();
        } catch (error) {
            console.log(error);
            toast.error("Failed to reject booking");
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-md p-5 w-full h-full flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold leading-tight text-gray-800">Recent Requests</h2>
                <button className="text-xs font-medium text-green-600 hover:text-green-800">View All</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-3">
                    {loading ? (
                        <p className="text-sm text-gray-500 text-center py-4">Loading requests...</p>
                    ) : requests.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No booking requests found.</p>
                    ) : requests.map((req) => (
                        <div key={req._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-sm text-gray-800">{req.userId?.name || 'Unknown User'}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>{req.status}</span>
                            </div>
                            <p className="text-xs text-gray-500">{req.venueId?.name || 'Venue'}</p>
                            <p className="text-xs text-gray-500 font-medium mt-1">${req.cost?.toLocaleString() || 0}</p>
                            <div className="flex justify-between items-center mt-1.5">
                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {new Date(req.date).toLocaleDateString()}
                                </p>
                                {req.status === 'approved' && (
                                    <button
                                        onClick={() => handleReject(req._id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BookingRequests