import { useState, useEffect } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { DollarSign, Building, CalendarCheck, CreditCard, AlertCircle } from "lucide-react";
import { getComplaintsList } from "../../services/complaintService";
import { useNavigate } from "react-router-dom";

const DashBoardCard = () => {
    const navigate = useNavigate();
    const { currentSubscription, loading } = useSubscription();
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

    const daysRemaining = currentSubscription ? getDaysRemaining(currentSubscription.endDate) : null;
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 5;

    // determine colors based on expiry status
    let subBorderColor = "border-purple-100";
    let subBgColor = "bg-purple-50";
    let expiryColorClass = "text-gray-600";
    let statusColorClass = "text-purple-600";
    
    if (currentSubscription) {
        if (currentSubscription.status === "expired") {
            subBorderColor = "border-red-200";
            subBgColor = "bg-red-50";
            expiryColorClass = "text-red-600 font-bold";
            statusColorClass = "text-red-600 font-bold";
        } else if (isExpiringSoon) {
            subBorderColor = "border-red-200 animate-pulse";
            subBgColor = "bg-red-50";
            expiryColorClass = "text-red-600 font-bold";
            statusColorClass = "text-red-500 font-bold";
        }
    } else {
        subBorderColor = "border-gray-200";
        subBgColor = "bg-gray-50";
        statusColorClass = "text-gray-500";
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

            {/* Subscription Card */}
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
                                <span>SUBSCRIPTION</span>
                                <CreditCard className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
                            </div>
                            <div className="text-2xl font-bold mb-2 text-gray-900 truncate">
                                {currentSubscription ? (currentSubscription.planSnapshot?.name || "Premium Partner") : "No Active Plan"}
                            </div>
                        </div>
                        <div className="text-xs space-y-1.5 font-medium text-gray-600 mt-2">
                            {currentSubscription ? (
                                <>
                                    <div className="flex justify-between">
                                        <span>Start Date:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(currentSubscription.startDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Expiry Date:</span>
                                        <span className={`font-semibold ${expiryColorClass}`}>{formatDate(currentSubscription.endDate)}</span>
                                    </div>
                                    <div className="pt-1.5 border-t border-gray-100 mt-1 flex justify-between items-center text-sm font-semibold">
                                        <span>Status:</span>
                                        <span className={`${statusColorClass} capitalize`}>
                                            {currentSubscription.status} {daysRemaining !== null && daysRemaining > 0 && `(${daysRemaining}d remaining)`}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-red-500 font-bold text-sm">
                                    Subscribe to activate listings
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashBoardCard;