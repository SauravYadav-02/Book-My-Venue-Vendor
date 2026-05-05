function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="form-label">
            {children}
            {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
    );
}

export default Label;
