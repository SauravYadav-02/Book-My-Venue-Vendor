function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="form-section">
            <p className="form-section-title">{title}</p>
            {children}
        </div>
    );
}

export default SectionCard;
