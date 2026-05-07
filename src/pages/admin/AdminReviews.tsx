import { useEffect, useState } from "react";
import axios from "axios";
import { differenceInDays } from "date-fns";
import { Star, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
    _id: string;
    venueId: string;
    venueName: string;
    userId: { _id: string; name: string; email: string };
    rating: number;
    feedback: string;
    status: string;
    createdAt: string;
    reviewEligibleAt: string;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            // using admin token if exists, otherwise assume mock or global admin route
            const token = localStorage.getItem("token") || "";
            const res = await axios.get("http://localhost:5000/api/admin/reviews", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data);
        } catch (error) {
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const updateStatus = async (venueId: string, reviewId: string, status: string) => {
        try {
            const token = localStorage.getItem("token") || "";
            await axios.patch(`http://localhost:5000/api/admin/reviews/${venueId}/${reviewId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Review ${status} successfully`);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update review status");
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center">Loading reviews...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Review Management</h1>
            <div className="grid gap-4">
                {reviews.map((review) => {
                    const eligibleDate = new Date(review.reviewEligibleAt);
                    const now = new Date();
                    const isEligible = now >= eligibleDate;
                    const daysRemaining = differenceInDays(eligibleDate, now);

                    return (
                        <div key={review._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">{review.venueName}</h3>
                                <p className="text-sm text-gray-500">By {review.userId?.name} ({review.userId?.email})</p>
                                <div className="flex items-center gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                    ))}
                                </div>
                                <p className="text-gray-700 mt-2 text-sm">{review.feedback}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                </span>
                                
                                {review.status === "pending" && (
                                    <>
                                        {!isEligible ? (
                                            <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                <Clock size={14} />
                                                Waiting Period: {daysRemaining} days left
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(review.venueId, review._id, "approved")} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm transition-colors border border-green-200">
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button onClick={() => updateStatus(review.venueId, review._id, "rejected")} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm transition-colors border border-red-200">
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {reviews.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No reviews found.</div>
                )}
            </div>
        </div>
    );
}
