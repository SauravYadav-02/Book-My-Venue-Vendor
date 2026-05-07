function Toast({ message, show }: { message: string; show: boolean }) {
    if (!show) return null;
    return (
        <div
            className={[
                "flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 mb-5",
                // Responsive padding
                "px-3 py-2.5 sm:px-4 sm:py-3",
                // Responsive font size: xs=12px → sm=13px → md=14px
                "text-xs sm:text-[13px] md:text-sm",
                // Responsive font weight
                "font-medium sm:font-semibold",
            ].join(" ")}
        >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            </span>
            {message}
        </div>
    );
}

export default Toast;