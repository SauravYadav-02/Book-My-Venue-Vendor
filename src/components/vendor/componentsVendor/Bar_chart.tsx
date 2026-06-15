import React, { useState, useEffect } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";
import { getVendorPaymentHistory } from "../../../services/paymentHistoryService";

// Data type
interface DataItem {
    label: string;
    value: number;
}

const Bar_chart: React.FC = () => {
    const [view, setView] = useState<"month" | "year">("month");
    const [monthlyData, setMonthlyData] = useState<DataItem[]>([]);
    const [yearlyData, setYearlyData] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(true);

    const vendorId = localStorage.getItem("vendorId") || "";

    useEffect(() => {
        if (!vendorId) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                // Fetch successful booking payments (revenue) for this vendor
                const history = await getVendorPaymentHistory(vendorId, {
                    type: "booking",
                    paymentStatus: "success",
                });

                const currentYear = new Date().getFullYear();
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // 1. Group by month for current year
                const mData: DataItem[] = monthNames.map((name) => ({
                    label: name,
                    value: 0,
                }));

                // 2. Group by year
                const yMap: { [year: string]: number } = {};

                history.forEach((record) => {
                    const date = new Date(record.paymentTimestamp || record.createdAt);
                    const recordYear = date.getFullYear();

                    if (recordYear === currentYear) {
                        const monthIndex = date.getMonth();
                        mData[monthIndex].value = Number((mData[monthIndex].value + record.amount).toFixed(2));
                    }

                    const yearStr = recordYear.toString();
                    yMap[yearStr] = Number(((yMap[yearStr] || 0) + record.amount).toFixed(2));
                });

                // If no yearly data, seed the current year as 0
                if (Object.keys(yMap).length === 0) {
                    yMap[currentYear.toString()] = 0;
                }

                const yData: DataItem[] = Object.keys(yMap)
                    .sort()
                    .map((year) => ({
                        label: year,
                        value: yMap[year],
                    }));

                setMonthlyData(mData);
                setYearlyData(yData);
            } catch (error) {
                console.error("Failed to load real revenue data for bar chart:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [vendorId]);

    const data = view === "month" ? monthlyData : yearlyData;

    if (loading) {
        return (
            <div className="p-4 sm:p-5 bg-white rounded-xl shadow-md w-full h-[320px] sm:h-[360px] md:h-[380px] flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-sm text-gray-500 mt-3 font-medium">Loading revenue analytics...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-5 bg-white rounded-xl shadow-md w-full">
            {/* Header */}
            <div className="mb-3">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold">
                    Revenue Analytics
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Monthly growth and performance
                </p>
            </div>

            {/* Toggle */}
            <div className="flex justify-end mb-3">
                <div className="bg-gray-100 rounded-md p-1 flex">
                    <button
                        onClick={() => setView("month")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition cursor-pointer ${
                            view === "month"
                                ? "bg-white shadow font-medium text-gray-900"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Month
                    </button>

                    <button
                        onClick={() => setView("year")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition cursor-pointer ${
                            view === "year"
                                ? "bg-white shadow font-medium text-gray-900"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[220px] sm:h-[260px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            axisLine={{ stroke: "#cbd5e1" }}
                            tickLine={{ stroke: "#cbd5e1" }}
                        />

                        <YAxis
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            axisLine={{ stroke: "#cbd5e1" }}
                            tickLine={{ stroke: "#cbd5e1" }}
                            tickFormatter={(val) => `₹${val}`}
                        />

                        <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        />

                        <Bar
                            dataKey="value"
                            fill="#22c55e"
                            radius={[6, 6, 0, 0]}
                            barSize={35}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Bar_chart;