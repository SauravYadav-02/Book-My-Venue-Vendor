

function SelectField({
    id, value, onChange, options, error,
}: {
    id: string; value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; error?: string;
}) {
    return (
        <div>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all outline-none
          text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-400/30
          ${error
                        ? "border-rose-300 focus:border-rose-400"
                        : "border-slate-200 focus:border-emerald-400"
                    }`}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export default SelectField;