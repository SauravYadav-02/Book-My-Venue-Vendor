import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getVenuesByVendor } from "../../services/venueService";
import { getVendorReviews, type Review, type VendorReviewsResponse } from "../../services/ratingService";
import { Star, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MessageSquareOff } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Analytics = VendorReviewsResponse['analytics'];

interface Venue {
    _id: string;
    name: string;
}

export default function VendorReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [venueStats, setVenueStats] = useState<{ [key: string]: { averageRating: number; totalReviews: number } }>({});

    const [loading, setLoading] = useState(true);

    // Filters and Pagination
    const [sort, setSort] = useState("latest");
    const [selectedVenue, setSelectedVenue] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const vendorId = localStorage.getItem("vendorId");

    useEffect(() => {
        let mounted = true;
        const fetchVenuesData = async () => {
            try {
                if (!vendorId) return;
                const data = await getVenuesByVendor(vendorId);
                if (mounted) {
                    setVenues(data.map((v: any) => ({ _id: v._id, name: v.name })));
                }
            } catch (error) {
                console.error("Failed to fetch venues", error);
            }
        };
        fetchVenuesData();
        return () => { mounted = false; };
    }, [vendorId]);

    const fetchReviewsData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setLoading(true);
            if (!vendorId) return;

            const data = await getVendorReviews(vendorId, {
                sort,
                venueId: selectedVenue,
                page,
                limit
            });

            setReviews(data.reviews || []);
            if (data.analytics) setAnalytics(data.analytics);
            if (data.venueStats) setVenueStats(data.venueStats);
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

    const renderStars = (rating: number, sizeOrClass: number | string = 14) => {
        const isClass = typeof sizeOrClass === "string";
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={isClass ? undefined : (sizeOrClass as number)}
                        className={isClass ? `${sizeOrClass} ${
                            i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        }` : (i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200")}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reviews & Ratings</h1>
                    <p className="text-slate-500 mt-1">Track your performance and manage guest feedback.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-600">Live Feedback Stream</span>
                </div>
            </div>

            {/* Analytics Section */}
            {analytics && (
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                    {/* Overall Vendor Rating */}
                    <div className="bg-white p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-50 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 transition-transform group-hover:scale-110 duration-500"></div>
                        <p className="text-slate-400 font-semibold uppercase tracking-wider text-[8px] sm:text-[10px] md:text-xs mb-2 sm:mb-4">Vendor Rating</p>
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-800 tabular-nums leading-none">{analytics.averageRating}</h2>
                            <div className="mt-2 sm:mt-4">
                                {renderStars(analytics.averageRating, "w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-5 md:h-5")}
                            </div>
                        </div>
                        <p className="text-[9px] sm:text-xs md:text-sm text-slate-400 mt-4 sm:mt-6 font-medium">Global average score</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-white p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                        <p className="text-slate-800 font-bold mb-3 sm:mb-6 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm md:text-base">
                            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-indigo-500" />
                            Score Distribution
                        </p>
                        <div className="space-y-1.5 sm:space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = analytics.distribution[star] || 0;
                                const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-xs md:text-sm">
                                        <div className="flex items-center gap-0.5 sm:gap-1 w-6 sm:w-12 shrink-0">
                                            <span className="font-bold text-slate-700">{star}</span>
                                            <Star className="text-yellow-400 fill-yellow-400 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                                        </div>
                                        <div className="flex-1 h-2 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                                            />
                                        </div>
                                        <div className="w-6 sm:w-10 text-right font-semibold text-slate-500 tabular-nums">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-between">
                        <p className="font-medium opacity-80 text-[9px] sm:text-xs md:text-sm">Total Reviews Received</p>
                        <div className="flex items-baseline gap-1 mt-2 sm:mt-4">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">{analytics.totalReviews}</h2>
                            <span className="text-indigo-200 font-medium text-[9px] sm:text-xs md:text-sm">Feedbacks</span>
                        </div>
                        <div className="mt-2 pt-2 sm:mt-4 sm:pt-4 border-t border-white/10 flex justify-between items-center text-[9px] sm:text-xs md:text-sm">
                            <span>Verified responses</span>
                            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
                        </div>
                    </div>
                </div>
            )}

            {/* Venue Performance Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Star className="text-indigo-500 fill-indigo-500" size={20} />
                    Venue Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {venues.map(venue => {
                        const stats = venueStats[venue._id] || { averageRating: 0, totalReviews: 0 };
                        return (
                            <div key={venue._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md group">
                                <h4 className="font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{venue.name}</h4>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="text-sm font-black text-slate-800">{stats.averageRating}</span>
                                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">{stats.totalReviews} Reviews</span>
                                </div>
                                <div className="mt-3">
                                    {renderStars(stats.averageRating, 12)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

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
                                                    {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:text-right">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
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
