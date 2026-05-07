import { STEPS } from "../types/Constants";

function StepBar({ current }: { current: number }) {
    return (
        <div className="flex items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;

                return (
                    <div key={i} className="flex items-center shrink-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">

                            {/* Step circle — responsive size */}
                            <div className={[
                                "flex shrink-0 items-center justify-center rounded-full transition-all duration-300",
                                // Responsive circle size: xs=24px → sm=28px → md=32px
                                "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8",
                                // Responsive font size inside circle
                                "text-[10px] sm:text-xs md:text-[13px]",
                                // Responsive font weight
                                "font-bold",
                                done
                                    ? "bg-emerald-500 text-white"
                                    : active
                                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                                        : "bg-slate-100 text-slate-400 border border-slate-200",
                            ].join(" ")}>
                                {done ? (
                                    <svg
                                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : i + 1}
                            </div>

                            {/* Step label — responsive size & weight */}
                            <span className={[
                                "whitespace-nowrap transition-colors duration-300",
                                // Responsive font size: xs=10px → sm=11px → md=12px → lg=13px
                                "text-[10px] sm:text-[11px] md:text-xs lg:text-[13px]",
                                // Responsive font weight: medium on mobile, semibold on desktop
                                "font-medium sm:font-semibold",
                                active
                                    ? "text-emerald-700"
                                    : done
                                        ? "text-slate-500"
                                        : "text-slate-300",
                                // Hide inactive labels on very small screens
                                active ? "" : "hidden sm:inline",
                            ].join(" ")}>
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                            <div className={[
                                "rounded-full transition-colors duration-300",
                                // Responsive width & margin
                                "mx-2 h-0.5 w-5 sm:mx-3 sm:w-7 md:mx-4 md:w-9",
                                done ? "bg-emerald-400/60" : "bg-slate-100",
                            ].join(" ")} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StepBar;