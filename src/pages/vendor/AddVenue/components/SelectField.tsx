function SelectField({
    id, value, onChange, options, error,
}: {
    id: string; value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; error?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={[
                    // Layout & shape
                    "w-full rounded-xl border bg-slate-50 outline-none transition-all duration-200 cursor-pointer appearance-none",
                    // Responsive padding
                    "px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5",
                    // Responsive font size: xs=13px → sm=14px → md=15px → lg=16px
                    "text-[13px] sm:text-sm md:text-[15px] lg:text-base",
                    // Responsive font weight
                    "font-normal sm:font-medium",
                    // Custom chevron arrow
                    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center] bg-[length:16px]",
                    // Colors
                    "text-slate-800",
                    // Focus
                    "focus:bg-white focus:ring-2 focus:ring-emerald-400/30",
                    // Error state
                    error
                        ? "border-rose-300 focus:border-rose-400"
                        : "border-slate-200 focus:border-emerald-400",
                ].join(" ")}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.value === ""}>
                        {o.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-rose-500">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export default SelectField;