
function TextareaField({
    id, placeholder, value, onChange, error,
}: {
    id: string; placeholder?: string; value: string;
    onChange: (v: string) => void; error?: string;
}) {
    return (
        <div className="field-stack">
            <textarea
                id={id}
                placeholder={placeholder}
                value={value}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
                className={`form-control form-textarea ${error ? "form-control-error" : ""}`}
            />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export default TextareaField;
