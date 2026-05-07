function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            className={[
                "sm:rounded-2xl sm:border sm:border-slate-100 bg-white sm:shadow-sm sm:shadow-slate-100/80",
                "flex flex-col",
                // Responsive padding & gap: no horizontal padding on mobile to maximize space
                "py-4 gap-4 sm:p-6 sm:gap-6",
            ].join(" ")}
        >
            {/* Section title: responsive size & weight */}
            <p
                className={[
                    "uppercase tracking-[0.12em] text-slate-400",
                    // xs=9px/bold → sm=10px/bold → md=11px/extrabold
                    "text-[9px] font-bold sm:text-[10px] md:text-[11px] md:font-extrabold",
                ].join(" ")}
            >
                {title}
            </p>
            {children}
        </div>
    );
}

export default SectionCard;