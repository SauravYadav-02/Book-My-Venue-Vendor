function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label
            className={[
                // Responsive font size: xs=11px → sm=12px → md=13px → lg=14px
                "text-[11px] sm:text-xs md:text-[13px] lg:text-sm",
                // Responsive font weight: medium on mobile, semibold on larger screens
                "font-medium sm:font-semibold",
                // Color & spacing
                "text-slate-700 leading-none tracking-wide",
            ].join(" ")}
        >
            {children}
            {required && (
                <span className="text-rose-400 ml-1 text-[11px] sm:text-xs">*</span>
            )}
        </label>
    );
}

export default Label;