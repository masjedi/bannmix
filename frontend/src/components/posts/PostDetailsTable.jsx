const PostDetailsTable = ({ title, icon: Icon, rows = [] }) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-line bg-theme-surface shadow-sm">
            <div className="flex items-center gap-3 border-b border-line bg-theme-page px-5 py-4 sm:px-6">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    {Icon && <Icon size={17} />}
                </span>

                <h2 className="text-base font-extrabold text-content">
                    {title}
                </h2>
            </div>

            <dl className="grid md:grid-cols-2">
                {rows.map((row, index) => {
                    const RowIcon = row.icon;
                    const value =
                        row.value === null ||
                        row.value === undefined ||
                        row.value === ""
                            ? "N/A"
                            : row.value;

                    return (
                        <div
                            key={`${row.label}-${index}`}
                            className="flex min-w-0 gap-3 border-b border-line px-5 py-4 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(odd)]:border-r sm:px-6"
                        >
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-theme-success-bg text-brand-green">
                                {RowIcon && <RowIcon size={15} />}
                            </span>

                            <div className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-content-muted">
                                    {row.label}
                                </dt>

                                <dd className="mt-1 break-words text-sm font-semibold text-content">
                                    {value}
                                </dd>
                            </div>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
};

export default PostDetailsTable;
