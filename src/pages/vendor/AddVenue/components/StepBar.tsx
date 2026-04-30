import { STEPS } from "../types/Constants";

function StepBar({ current }: { current: number }) {
    return (
        <div className="flex items-center mb-8 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
                <div key={i} className="flex items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all duration-300
              ${i < current
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : i === current
                                    ? "bg-emerald-500 text-white ring-[5px] ring-emerald-100 shadow-sm"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}>
                            {i < current ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : i + 1}
                        </div>
                        <span className={`text-[13.5px] font-bold whitespace-nowrap transition-colors duration-300
              ${i === current ? "text-emerald-700" : i < current ? "text-slate-600" : "text-slate-300"}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`w-10 h-1 rounded-full mx-4 transition-colors duration-300 ${i < current ? "bg-emerald-400/50" : "bg-slate-100"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default StepBar;