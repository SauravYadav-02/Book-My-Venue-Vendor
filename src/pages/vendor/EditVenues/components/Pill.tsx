interface PillProps {
    icon: string;
    label: string;
}

export default function Pill({ icon, label }: PillProps) {
    return (
        <span className="flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600
            px-2 py-0.5 rounded-full border border-slate-200 font-medium">
            <span style={{ fontSize: 11 }}>{icon}</span>
            {label}
        </span>
    );
}