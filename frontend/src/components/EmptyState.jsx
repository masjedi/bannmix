const EmptyState = ({ title = "No records found", description }) => {
    return (
        <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
            <h3 className="text-lg font-extrabold text-content">
                {title}
            </h3>
            {description && (
                <p className="mt-2 text-sm text-content-muted">{description}</p>
            )}
        </div>
    );
};

export default EmptyState;
