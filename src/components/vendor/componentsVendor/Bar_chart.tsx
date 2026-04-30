import React, { useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";

// Data type
interface DataItem {
    label: string;
    value: number;
}

const Bar_chart: React.FC = () => {
    const [view, setView] = useState<"month" | "year">("month");

    // Monthly data
    const monthlyData: DataItem[] = [
        { label: "Jan", value: 100 },
        { label: "Feb", value: 200 },
        { label: "Mar", value: 300 },
        { label: "Apr", value: 250 },
        { label: "May", value: 400 },
        { label: "Jun", value: 280 },
    ];

    // Yearly data
    const yearlyData: DataItem[] = [
        { label: "2019", value: 2000 },
        { label: "2020", value: 3500 },
        { label: "2021", value: 5000 },
        { label: "2022", value: 4200 },
        { label: "2023", value: 6100 },
    ];

    // Dynamic data
    const data = view === "month" ? monthlyData : yearlyData;

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
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition ${view === "month"
                            ? "bg-white shadow font-medium"
                            : "text-gray-500"
                            }`}
                    >
                        Month
                    </button>

                    <button
                        onClick={() => setView("year")}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition ${view === "year"
                            ? "bg-white shadow font-medium"
                            : "text-gray-500"
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

                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                        />

                        <YAxis tick={{ fontSize: 10 }} />

                        <Tooltip />

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