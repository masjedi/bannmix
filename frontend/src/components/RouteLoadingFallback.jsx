const RouteLoadingFallback = () => {
    return (
        <div className="flex min-h-[40vh] items-center justify-center px-4">
            <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange/25 border-t-brand-orange"
                role="status"
                aria-label="Loading page"
            />
        </div>
    );
};

export default RouteLoadingFallback;
