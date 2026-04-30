
function TextareaField({
    id, placeholder, value, onChange, error,
}: {
    id: string; placeholder?: string; value: string;
    onChange: (v: string) => void; error?: string;
}) {
    return (
        <div>
            <textarea
                id={id}
                placeholder={placeholder}
                value={value}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all outline-none resize-none
          text-slate-800 placeholder:text-slate-300 leading-relaxed
          focus:bg-white focus:ring-2 focus:ring-emerald-400/30
          ${error
                        ? "border-rose-300 focus:border-rose-400"
                        : "border-slate-200 focus:border-emerald-400"
                    }`}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

export default TextareaField;