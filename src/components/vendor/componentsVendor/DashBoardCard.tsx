import { DollarSign, Building, CalendarCheck } from "lucide-react";

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
    },
];

const DashBoardCard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {cardData.map(({ id, title, value, subtext, subtextColor, Icon, borderColor, bgColor }) => (
                <div
                    key={id}
                    className={`border rounded-xl p-6 shadow-sm w-full ${borderColor} ${bgColor}`}
                >
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3 font-semibold tracking-wide">
                        <span>{title}</span>
                        <Icon className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
                    </div>

                    <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>

                    <div className={`text-sm font-medium ${subtextColor}`}>
                        {subtext}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashBoardCard;
