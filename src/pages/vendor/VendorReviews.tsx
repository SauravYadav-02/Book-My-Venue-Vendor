import { useEffect, useState, useCallback } from "react";
import { getVenuesByVendor } from "../../services/venueService";
import { getVendorReviews } from "../../services/ratingService";
import { Star, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MessageSquareOff } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
    _id: string;
    userId: { name: string; profilePhoto: string } | null;
    venueId: { _id: string; name: string } | null;
    rating: number;
    feedback: string;
    status: string;
    createdAt: string;
}

interface Analytics {
    averageRating: number;
    totalReviews: number;
    distribution: { [key: string]: number };
}

interface Venue {
    _id: string;
    name: string;
}

export default function VendorReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    
    const [loading, setLoading] = useState(true);
    
    // Filters and Pagination
    const [sort, setSort] = useState("latest");
    const [selectedVenue, setSelectedVenue] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const vendorId = localStorage.getItem("vendorId");

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                if (!vendorId) return;
                const data = await getVenuesByVendor(vendorId);
                // The service returns the venues, we map to the local Venue interface
                setVenues(data.map(v => ({ _id: v._id, name: v.name }))); 
            } catch (error) {
                console.error("Failed to fetch venues", error);
            }
        };
        fetchVenues();
    }, [vendorId]);

    const fetchReviewsData = useCallback(async () => {
        try {
            setLoading(true);
            if (!vendorId) return;
            
            const data = await getVendorReviews(vendorId, {
                sort,
                venueId: selectedVenue,
                page,
                limit
            });
            
            setReviews(data.reviews || []);
            if (data.analytics) setAnalytics(data.analytics);
            setTotalPages(data.totalPages || 1);
            setPage(data.currentPage || 1);
            
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            toast.error("Failed to load reviews.");
        } finally {
            setLoading(false);
        }
    }, [vendorId, sort, selectedVenue, page]);



    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReviewsData();
    }, [fetchReviewsData]);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={14} 
                        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reviews & Ratings</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage feedback across all your venues.</p>
                </div>
            </div>

            {/* Analytics Section */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <p className="text-slate-500 font-medium mb-2">Average Rating</p>
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl font-extrabold text-slate-800">{analytics.averageRating}</h2>
                            <Star className="text-yellow-400 fill-yellow-400" size={32} />
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Across all your venues</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <p className="text-slate-500 font-medium mb-2">Total Reviews</p>
                        <h2 className="text-4xl font-extrabold text-indigo-600">{analytics.totalReviews}</h2>
                        <p className="text-sm text-slate-400 mt-2">Authentic feedback</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 font-medium mb-4 text-center">Rating Distribution</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = analytics.distribution[star] || 0;
                                const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 w-10">
                                            <span className="font-medium text-slate-600">{star}</span>
                                            <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                        </div>
                                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-8 text-right text-slate-500 text-xs">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={18} className="text-slate-400" />
                    <select 
                        value={selectedVenue} 
                        onChange={(e) => { setSelectedVenue(e.target.value); setPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64 p-2.5 outline-none text-sm"
                    >
                        <option value="all">All Venues</option>
                        {venues.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ArrowUpDown size={18} className="text-slate-400" />
                    <select 
                        value={sort} 
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-48 p-2.5 outline-none text-sm"
                    >
                        <option value="latest">Latest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : null}

                {!loading && reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <MessageSquareOff size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-500">No reviews found.</p>
                        <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                                            {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-lg">
                                                {review.userId?.name || "Unknown User"}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                {renderStars(review.rating)}
                                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                    {review.venueId?.name || "Unknown Venue"}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:text-right">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            review.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                            review.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                            'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pl-0 md:pl-16">
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {review.feedback || <span className="italic opacity-50">No text feedback provided.</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500">
                        Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
