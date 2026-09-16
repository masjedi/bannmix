const LoadingSpinner = ({ label = "Loading..." }) => {
    return (
        <div className="flex items-center justify-center py-10">
            <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-brand-orange/30 border-t-brand-orange" />
                <p className="text-sm font-medium text-content-muted">{label}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
