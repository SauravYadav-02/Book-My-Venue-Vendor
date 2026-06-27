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

const getAvatarColors = (name: string) => {
    const char = name.charAt(0).toUpperCase();
    const code = char.charCodeAt(0);
    
    const colors = [
        { bg: "bg-indigo-50 text-indigo-705 border-indigo-100", text: "text-indigo-705" },
        { bg: "bg-emerald-50 text-emerald-705 border-emerald-100", text: "text-emerald-705" },
        { bg: "bg-amber-50 text-amber-800 border-amber-100", text: "text-amber-800" },
        { bg: "bg-rose-50 text-rose-705 border-rose-100", text: "text-rose-705" },
        { bg: "bg-violet-50 text-violet-750 border-violet-100", text: "text-violet-750" },
        { bg: "bg-sky-50 text-sky-705 border-sky-100", text: "text-sky-705" },
    ];
    
    return colors[code % colors.length];
};

const renderCommentAsList = (feedback: string) => {
    if (!feedback) {
        return <span className="italic opacity-50 text-slate-400 text-xs">No text feedback provided.</span>;
    }

    // First split by newlines
    let lines = feedback.split('\n').map(line => line.trim()).filter(Boolean);

    // If there is only one line, check if we can split by sentences (periods followed by space)
    if (lines.length === 1) {
        const sentenceSplit = lines[0]
            .split(/\.(?:\s+|$)/)
            .map(s => s.trim())
            .filter(Boolean);
        if (sentenceSplit.length > 1) {
            lines = sentenceSplit;
        }
    }

    // Clean up list markers (-, *, •, 1., 2., etc.) from the start of each line
    const cleanLines = lines.map(line => {
        return line
            .replace(/^[-*•]\s*/, '') // Remove bullets like -, *, •
            .replace(/^\d+\.\s*/, '') // Remove numbered prefixes like 1., 2.
            .trim();
    }).filter(Boolean);

    if (cleanLines.length === 0) {
        return <span className="italic opacity-50 text-slate-400 text-xs">No text feedback provided.</span>;
    }

    return (
        <ul className="list-disc pl-4 space-y-1.5 text-slate-600 text-sm">
            {cleanLines.map((line, idx) => (
                <li key={idx} className="leading-relaxed">
                    {line}
                </li>
            ))}
        </ul>
    );
};

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
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 bg-[#f8f9fa] min-h-screen">
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Reviews & Ratings</h1>
                    <p className="text-slate-500 mt-1 text-xs sm:text-sm">Track your performance and manage guest feedback.</p>
                </div>
                <div className="bg-emerald-50/60 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Live Feedback Stream</span>
                </div>
            </div>

            {/* Analytics Section */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                    {/* Overall Vendor Rating */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50/50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                        <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-xs mb-3">Vendor Rating</p>
                        <div className="flex flex-col items-center gap-1 z-10">
                            <h2 className="text-5xl md:text-6xl font-black text-slate-800 tabular-nums leading-none">{analytics.averageRating}</h2>
                            <div className="mt-3">
                                {renderStars(analytics.averageRating, 16)}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-5 font-medium z-10">Global average score</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100/80 md:col-span-2">
                        <p className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
                            <Filter className="w-4 h-4 text-indigo-500" />
                            Score Distribution
                        </p>
                        <div className="space-y-2.5 sm:space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = analytics.distribution[star] || 0;
                                const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-xs sm:text-sm">
                                        <div className="flex items-center gap-1 w-10 sm:w-12 shrink-0">
                                            <span className="font-bold text-slate-700">{star}</span>
                                            <Star className="text-yellow-400 fill-yellow-400 w-3 h-3" />
                                        </div>
                                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                                            />
                                        </div>
                                        <div className="w-8 text-right font-semibold text-slate-500 tabular-nums">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-850 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white flex flex-col justify-between min-h-[150px] md:min-h-auto">
                        <p className="font-medium opacity-85 text-xs">Total Reviews Received</p>
                        <div className="flex items-baseline gap-1.5 mt-4">
                            <h2 className="text-4xl md:text-5xl font-black">{analytics.totalReviews}</h2>
                            <span className="text-indigo-200 font-medium text-xs sm:text-sm">Feedbacks</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                            <span className="opacity-80">Verified responses</span>
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                        </div>
                    </div>
                </div>
            )}

            {/* Venue Performance Section */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100/80">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <Star className="text-indigo-500 fill-indigo-500" size={18} />
                    Venue Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {venues.map(venue => {
                        const stats = venueStats[venue._id] || { averageRating: 0, totalReviews: 0 };
                        return (
                            <div key={venue._id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 group">
                                <h4 className="font-bold text-slate-700 truncate group-hover:text-indigo-655 transition-colors text-sm">{venue.name}</h4>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-sm">
                                        <span className="text-xs font-black text-slate-800">{stats.averageRating}</span>
                                        <Star className="text-yellow-400 fill-yellow-400" size={11} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">{stats.totalReviews} Reviews</span>
                                </div>
                                <div className="mt-3">
                                    {renderStars(stats.averageRating, 11)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        value={selectedVenue}
                        onChange={(e) => { setSelectedVenue(e.target.value); setPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full sm:w-64 p-2.5 outline-none text-xs sm:text-sm transition-all cursor-pointer"
                    >
                        <option value="all">All Venues</option>
                        {venues.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ArrowUpDown size={16} className="text-slate-400" />
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full sm:w-48 p-2.5 outline-none text-xs sm:text-sm transition-all cursor-pointer"
                    >
                        <option value="latest">Latest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden min-h-[300px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : null}

                {!loading && reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6">
                        <MessageSquareOff size={44} className="mb-3 opacity-25 text-indigo-500" />
                        <p className="text-base font-semibold text-slate-600">No reviews found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-5 sm:p-6 hover:bg-slate-50/30 transition-all duration-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        {/* Avatar with dynamic initials colors */}
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border shadow-sm ${getAvatarColors(review.userId?.name || "U").bg}`}>
                                            {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-base sm:text-lg leading-snug">
                                                {review.userId?.name || "Unknown User"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {renderStars(review.rating, 13)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="shrink-0">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
                                            review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                                            review.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                                            'bg-amber-50 text-amber-700 border-amber-150'
                                        }`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Metadata sub-row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400 font-medium sm:pl-14">
                                    <span className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded text-slate-600 border border-slate-200/40">
                                        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                        {review.venueId?.name || "Unknown Venue"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                </div>

                                {/* Feedback Comment box */}
                                <div className="mt-3.5 sm:pl-14">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200/60 transition-colors">
                                        {renderCommentAsList(review.feedback)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100/80">
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
