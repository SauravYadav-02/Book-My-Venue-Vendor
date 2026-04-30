function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 mb-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">{title}</p>
            {children}
        </div>
    );
}

export default SectionCard;