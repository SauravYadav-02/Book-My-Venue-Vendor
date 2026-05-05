

function SelectField({
    id, value, onChange, options, error,
}: {
    id: string; value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; error?: string;
}) {
    return (
        <div className="field-stack">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`form-control ${error ? "form-control-error" : ""}`}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export default SelectField;
