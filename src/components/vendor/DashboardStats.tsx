import { useState, useEffect } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { DollarSign, Building, CalendarCheck, CreditCard, AlertCircle } from "lucide-react";
import { getComplaintsList } from "../../services/complaintService";
import { useNavigate } from "react-router-dom";

const DashBoardCard = () => {
    const navigate = useNavigate();
    const { vendorSubscription, venueUsage, loading } = useSubscription();
    const [activeComplaintsCount, setActiveComplaintsCount] = useState<number>(0);

    useEffect(() => {
        const vendorId = localStorage.getItem("vendorId");
        if (vendorId) {
            getComplaintsList({ vendorid: vendorId })
                .then((list) => {
                    const activeCount = list.filter(
                        (c) => c.status === "Open" || c.status === "In Progress"
                    ).length;
                    setActiveComplaintsCount(activeCount);
                })
                .catch(console.error);
        }
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
            value: "$142,850.00",
            subtext: "+12.5% from last month",
            subtextColor: "text-green-600",
            Icon: DollarSign,
            borderColor: "border-green-100",
            bgColor: "bg-green-50",
            path: null
        },
        {
            id: 2,
            title: "ACTIVE LISTINGS",
            value: "12",
            subtext: "4 pending optimization",
            subtextColor: "text-gray-600",
            Icon: Building,
            borderColor: "border-blue-100",
            bgColor: "bg-blue-50",
            path: "/venue"
        },
        {
            id: 3,
            title: "PENDING BOOKINGS",
            value: "28",
            subtext: "Requires immediate action",
            subtextColor: "text-red-600",
            Icon: CalendarCheck,
            borderColor: "border-red-100",
            bgColor: "bg-red-50",
            path: "/booking"
        },
        {
            id: 4,
            title: "ACTIVE COMPLAINTS",
            value: String(activeComplaintsCount),
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 w-full">
                {cardData.map(({ id, title, value, subtext, subtextColor, Icon, borderColor, bgColor, path }) => (
                    <div
                        key={id}
                        onClick={() => path && navigate(path)}
                        className={`border rounded-xl p-6 shadow-sm w-full ${borderColor} ${bgColor} flex flex-col justify-between ${path ? "cursor-pointer hover:shadow-md transition-all active:scale-[0.99]" : ""}`}
                    >
                        <div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-3 font-semibold tracking-wide">
                                <span>{title}</span>
                                <Icon className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
                            </div>
                            <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>
                        </div>
                        <div className={`text-sm font-medium ${subtextColor}`}>{subtext}</div>
                    </div>
                ))}

                {/* New Current Plan Widget */}
                <div className={`border rounded-xl p-6 shadow-sm w-full ${subBorderColor} ${subBgColor} flex flex-col justify-between`}>
                    {loading ? (
                        <div className="animate-pulse flex flex-col justify-between h-full">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-3 font-semibold tracking-wide">
                                    <span>CURRENT PLAN</span>
                                    <CreditCard className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
                                </div>
                                <div className="text-xl font-bold text-gray-900 truncate">
                                    {vendorSubscription ? (vendorSubscription.planId?.name || "Standard Plan") : "Free Tier"}
                                </div>
                                {vendorSubscription && (
                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200/60 text-gray-700 uppercase tracking-wider">
                                        {vendorSubscription.cycle}
                                    </span>
                                )}
                            </div>
                            
                            <div className="text-xs space-y-1.5 font-medium text-gray-600 mt-2">
                                <div className="flex justify-between pt-1">
                                    <span>Venue Usage:</span>
                                    <span className="font-bold text-gray-800">
                                        {venueUsage} / {vendorSubscription ? vendorSubscription.planId?.maxVenues : 1}
                                    </span>
                                </div>
                                {vendorSubscription ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Expiry Date:</span>
                                            <span className={`font-semibold ${expiryColorClass}`}>{formatDate(vendorSubscription.expiresAt)}</span>
                                        </div>
                                        <div className="pt-1.5 border-t border-gray-150 mt-1 flex justify-between items-center text-sm font-semibold">
                                            <span>Status:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                                vendorSubscription.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : vendorSubscription.status === "grace"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {vendorSubscription.status}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-red-500 font-bold text-sm mt-1">
                                        No active plan found
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashBoardCard;