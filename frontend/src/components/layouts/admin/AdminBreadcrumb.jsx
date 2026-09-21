import { Link } from "react-router-dom";

const AdminBreadcrumb = ({ items = [] }) => {
    if (!items.length) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className="admin-breadcrumb">
            <ol className="admin-breadcrumb-list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`} className="admin-breadcrumb-item">
                            {item.to && !isLast ? (
                                <Link to={item.to} className="admin-breadcrumb-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        isLast
                                            ? "admin-breadcrumb-current"
                                            : "admin-breadcrumb-link-static"
                                    }
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            )}

                            {!isLast ? (
                                <span className="admin-breadcrumb-separator" aria-hidden="true">
                                    /
                                </span>
                            ) : null}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default AdminBreadcrumb;
