import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AdminBreadcrumbContext = createContext(null);

export const AdminBreadcrumbProvider = ({ children }) => {
    const [customItems, setCustomItems] = useState(null);

    const value = useMemo(
        () => ({
            customItems,
            setCustomItems,
        }),
        [customItems]
    );

    return (
        <AdminBreadcrumbContext.Provider value={value}>
            {children}
        </AdminBreadcrumbContext.Provider>
    );
};

export const useAdminBreadcrumbItems = (items) => {
    const context = useContext(AdminBreadcrumbContext);

    useEffect(() => {
        if (!context) {
            return undefined;
        }

        if (!items) {
            context.setCustomItems(null);
            return undefined;
        }

        context.setCustomItems(items);

        return () => {
            context.setCustomItems(null);
        };
    }, [context, items]);
};

export const useAdminBreadcrumbContext = () => {
    return useContext(AdminBreadcrumbContext);
};
