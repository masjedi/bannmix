import { useCallback, useEffect, useState } from "react";

import notificationsApi from "../../../api/notificationsApi";

const extractNotifications = (response) => {
    const payload = response?.data ?? response;
    const records = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

    return records;
};

const useAdminNotifications = ({ enabled = true, pollMs = 30000 } = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!enabled) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const [listResponse, countResponse] = await Promise.all([
                notificationsApi.getNotifications({ per_page: 12 }),
                notificationsApi.getUnreadCount(),
            ]);

            setNotifications(extractNotifications(listResponse));
            setUnreadCount(Number(countResponse?.count) || 0);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not load notifications."
            );
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (!enabled || !pollMs) {
            return undefined;
        }

        const intervalId = window.setInterval(refresh, pollMs);

        const handleFocus = () => refresh();
        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, [enabled, pollMs, refresh]);

    const markAsRead = useCallback(
        async (notificationId) => {
            await notificationsApi.markAsRead(notificationId);
            await refresh();
        },
        [refresh]
    );

    const markAllAsRead = useCallback(async () => {
        await notificationsApi.markAllAsRead();
        await refresh();
    }, [refresh]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refresh,
        markAsRead,
        markAllAsRead,
    };
};

export default useAdminNotifications;
