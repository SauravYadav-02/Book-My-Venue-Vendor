import { STEPS } from "../types/Constants";

function StepBar({ current }: { current: number }) {
    return (
        <div className="flex items-center overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((label, i) => (
                <div key={i} className="flex items-center shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300
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
                        <span className={`text-sm font-bold whitespace-nowrap transition-colors duration-300
              ${i === current ? "text-emerald-700" : i < current ? "text-slate-600" : "text-slate-300"}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`mx-3 h-1 w-7 rounded-full transition-colors duration-300 sm:mx-4 sm:w-10 ${i < current ? "bg-emerald-400/50" : "bg-slate-100"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default StepBar;
