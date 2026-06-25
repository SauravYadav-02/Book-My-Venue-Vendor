import { useState, useEffect } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { IndianRupee, Building, CalendarCheck, CreditCard, AlertCircle } from "lucide-react";
import { getComplaintsList } from "../../services/complaintService";
import { useNavigate } from "react-router-dom";
import { getVenuesByVendor } from "../../services/venueService";
import { getVendorBookings } from "../../services/bookingService";
import { getVendorPaymentHistory } from "../../services/paymentHistoryService";
import { currencyFormatter } from "../../utils/currency";

const DashBoardCard = () => {
    const navigate = useNavigate();
    const { vendorSubscription, venueUsage, loading: subLoading } = useSubscription();
    
    // Stats States
    const [activeComplaintsCount, setActiveComplaintsCount] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
    const [pendingListingsCount, setPendingListingsCount] = useState<number>(0);
    const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    const [growthText, setGrowthText] = useState<string>("No data");
    const [growthColor, setGrowthColor] = useState<string>("text-gray-500");

    useEffect(() => {
        const vendorId = localStorage.getItem("vendorId");
        if (!vendorId) {
            setStatsLoading(false);
            return;
        }

        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                // 1. Fetch complaints list & count active ones
                const complaints = await getComplaintsList({ vendorid: vendorId });
                const activeComplaints = complaints.filter(
                    (c) => c.status === "Open" || c.status === "In Progress"
                ).length;
                setActiveComplaintsCount(activeComplaints);

                // 2. Fetch venues to calculate active & pending listings
                const venuesRes = await getVenuesByVendor(vendorId);
                const venuesList = venuesRes?.data || [];
                const activeListings = venuesList.filter(
                    (v: any) => v.status === "approved" && !v.deactivated
                ).length;
                const pendingListings = venuesList.filter(
                    (v: any) => v.status === "pending"
                ).length;
                setActiveListingsCount(activeListings);
                setPendingListingsCount(pendingListings);

                // 3. Fetch bookings to calculate pending bookings
                const bookingsRes = await getVendorBookings(vendorId);
                const bookingsList = bookingsRes?.bookings || [];
                const pendingBookings = bookingsList.filter(
                    (b: any) => b.status === "pending"
                ).length;
                setPendingBookingsCount(pendingBookings);

                // 4. Fetch payment history to calculate revenue & growth
                const payments = await getVendorPaymentHistory(vendorId);
                const revenue = payments
                    .filter((p: any) => p.paymentStatus === "success" && p.type !== "subscription")
                    .reduce((sum: number, p: any) => sum + p.amount, 0);
                setTotalRevenue(revenue);

                // Calculate growth percent dynamically
                const now = new Date();
                const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

                const thisMonthRevenue = payments
                    .filter((p: any) => p.paymentStatus === "success" && p.type !== "subscription" && new Date(p.paymentTimestamp || p.createdAt) >= startOfThisMonth)
                    .reduce((sum: number, p: any) => sum + p.amount, 0);

                const lastMonthRevenue = payments
                    .filter((p: any) => p.paymentStatus === "success" && p.type !== "subscription" && new Date(p.paymentTimestamp || p.createdAt) >= startOfLastMonth && new Date(p.paymentTimestamp || p.createdAt) < startOfThisMonth)
                    .reduce((sum: number, p: any) => sum + p.amount, 0);

                if (lastMonthRevenue > 0) {
                    const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
                    setGrowthText(`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% from last month`);
                    setGrowthColor(growth >= 0 ? "text-green-600" : "text-red-650");
                } else if (thisMonthRevenue > 0) {
                    setGrowthText("+100% from last month");
                    setGrowthColor("text-green-600");
                } else {
                    setGrowthText("No earnings this month");
                    setGrowthColor("text-gray-500");
                }
            } catch (err) {
                console.error("Error loading dashboard stats:", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // format date helper
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Calculate days remaining helper
    const getDaysRemaining = (endDateStr?: string) => {
        if (!endDateStr) return null;
        const end = new Date(endDateStr);
        const now = new Date();
        end.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = vendorSubscription ? getDaysRemaining(vendorSubscription.expiresAt) : null;

    // determine colors based on expiry status
    let subBorderColor = "border-purple-100";
    let subBgColor = "bg-purple-50";
    let expiryColorClass = "text-gray-600";
    
    if (vendorSubscription) {
        if (vendorSubscription.status === "expired") {
            subBorderColor = "border-red-200 bg-red-50/20";
            subBgColor = "bg-red-50/20";
            expiryColorClass = "text-red-650 font-bold";
        } else if (vendorSubscription.status === "grace") {
            subBorderColor = "border-amber-250 animate-pulse bg-amber-50/30";
            subBgColor = "bg-amber-50/30";
            expiryColorClass = "text-amber-700 font-bold";
        } else {
            subBorderColor = "border-emerald-100 bg-emerald-50/10";
            subBgColor = "bg-emerald-50/10";
            expiryColorClass = "text-emerald-700 font-medium";
        }
    } else {
        subBorderColor = "border-gray-200";
        subBgColor = "bg-gray-50";
    }

    const cardData = [
        {
            id: 1,
            title: "TOTAL REVENUE",
            value: statsLoading ? "..." : currencyFormatter.format(totalRevenue),
            subtext: growthText,
            subtextColor: growthColor,
            Icon: IndianRupee,
            borderColor: "border-green-100",
            bgColor: "bg-green-50",
            path: "/payments"
        },
        {
            id: 2,
            title: "ACTIVE LISTINGS",
            value: statsLoading ? "..." : String(activeListingsCount),
            subtext: pendingListingsCount > 0 ? `${pendingListingsCount} pending approval` : "All listings active",
            subtextColor: pendingListingsCount > 0 ? "text-amber-600 font-semibold" : "text-green-600",
            Icon: Building,
            borderColor: "border-blue-100",
            bgColor: "bg-blue-50",
            path: "/venue"
        },
        {
            id: 3,
            title: "PENDING BOOKINGS",
            value: statsLoading ? "..." : String(pendingBookingsCount),
            subtext: pendingBookingsCount > 0 ? "Requires immediate action" : "No pending bookings",
            subtextColor: pendingBookingsCount > 0 ? "text-red-600 font-semibold" : "text-green-600",
            Icon: CalendarCheck,
            borderColor: "border-red-100",
            bgColor: "bg-red-50",
            path: "/booking"
        },
        {
            id: 4,
            title: "ACTIVE COMPLAINTS",
            value: statsLoading ? "..." : String(activeComplaintsCount),
            subtext: activeComplaintsCount > 0 ? "Requires resolution chat" : "No issues pending",
            subtextColor: activeComplaintsCount > 0 ? "text-red-600 font-semibold" : "text-green-600",
            Icon: AlertCircle,
            borderColor: activeComplaintsCount > 0 ? "border-red-200" : "border-gray-200",
            bgColor: activeComplaintsCount > 0 ? "bg-red-50/50" : "bg-gray-50",
            path: "/complaints"
        }
    ];

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Grace Period Warning Banner */}
            {vendorSubscription && vendorSubscription.status === "grace" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-700 shadow-sm animate-pulse">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                    <span className="font-semibold text-sm">
                        Your plan expires in {daysRemaining !== null ? daysRemaining : 0} days —{" "}
                        <button onClick={() => navigate("/vendor/pricing")} className="underline font-bold text-amber-800 hover:text-amber-950 transition">
                            renew now
                        </button>
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
                {cardData.map(({ id, title, value, subtext, subtextColor, Icon, borderColor, bgColor, path }) => (
                    <div
                        key={id}
                        onClick={() => path && navigate(path)}
                        className={`border rounded-xl p-4 md:p-6 shadow-sm w-full ${borderColor} ${bgColor} flex flex-col justify-between ${path ? "cursor-pointer hover:shadow-md transition-all active:scale-[0.99]" : ""}`}
                    >
                        <div>
                            <div className="flex justify-between items-center text-xs md:text-sm text-gray-600 mb-2 md:mb-3 font-semibold tracking-wide">
                                <span className="truncate">{title}</span>
                                <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-700 shrink-0" strokeWidth={2.5} />
                            </div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-gray-900 truncate">{value}</div>
                        </div>
                        <div className={`text-xs md:text-sm font-medium leading-tight ${subtextColor} truncate`}>{subtext}</div>
                    </div>
                ))}
            </div>

            {/* Current Plan Banner */}
            <div className={`border rounded-xl p-4 md:p-6 shadow-sm w-full ${subBorderColor} ${subBgColor} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
                {subLoading ? (
                    <div className="animate-pulse flex flex-row items-center justify-between w-full">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-gray-100">
                                <CreditCard className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Plan</div>
                                <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span>{vendorSubscription ? (vendorSubscription.planId?.name || "Standard Plan") : "Free Tier"}</span>
                                    {vendorSubscription && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200/60 text-gray-700 uppercase tracking-wider">
                                            {vendorSubscription.cycle}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm font-medium text-gray-600">
                            <div>
                                <span className="text-gray-400 mr-1.5">Venue Usage:</span>
                                <span className="font-bold text-gray-800">
                                    {venueUsage}/{vendorSubscription ? vendorSubscription.planId?.maxVenues : 1}
                                </span>
                            </div>
                            {vendorSubscription && (
                                <>
                                    <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                                    <div>
                                        <span className="text-gray-400 mr-1.5">Expires:</span>
                                        <span className={`font-semibold ${expiryColorClass}`}>{formatDate(vendorSubscription.expiresAt)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 font-medium hidden md:inline">Status:</span>
                            {vendorSubscription ? (
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                    vendorSubscription.status === "active"
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : vendorSubscription.status === "grace"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-red-100 text-red-850 border border-red-200"
                                }`}>
                                    {vendorSubscription.status}
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-100 text-red-850 border border-red-200">
                                    No active plan
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashBoardCard;