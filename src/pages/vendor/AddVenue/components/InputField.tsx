function InputField({
    id, type = "text", placeholder, value, onChange, error, min, step,
}: {
    id: string; type?: string; placeholder?: string; value: string;
    onChange: (v: string) => void; error?: string; min?: string; step?: string;
}) {
    return (
        <div>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                min={min}
                step={step}
                onChange={(e) => onChange(e.target.value)}
                required
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-3.5 rounded-xl text-sm sm:text-base md:text-lg font-normal sm:font-medium bg-slate-50 border transition-all outline-none
          text-slate-800 placeholder:text-slate-400
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

export default InputField;
