import { useEffect, useState } from "react";

import { postsApi } from "../../../api/postsApi";

import { getErrorMessage, normalizeList } from "./adminLayoutUtils";

const useAdminLayoutData = ({ locationPath, autoRefreshEnabled }) => {
    const [posts, setPosts] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState("");

    useEffect(() => {
        let active = true;
        let delayedRefreshTimer = null;
        let refreshInterval = null;

        const fetchAdminData = async () => {
            try {
                setActivityLoading(true);
                setActivityError("");

                const postsResult = await postsApi.getPosts();

                if (!active) {
                    return;
                }

                setPosts(normalizeList(postsResult));
            } catch (error) {
                if (active) {
                    setActivityError(
                        getErrorMessage(error, "Failed to load products.")
                    );
                }
            } finally {
                if (active) {
                    setActivityLoading(false);
                }
            }
        };

        fetchAdminData();

        delayedRefreshTimer = window.setTimeout(fetchAdminData, 1500);

        if (autoRefreshEnabled) {
            refreshInterval = window.setInterval(fetchAdminData, 30000);
        }

        const handleWindowFocus = () => {
            fetchAdminData();
        };

        window.addEventListener("focus", handleWindowFocus);

        return () => {
            active = false;

            if (delayedRefreshTimer) {
                window.clearTimeout(delayedRefreshTimer);
            }

            if (refreshInterval) {
                window.clearInterval(refreshInterval);
            }

            window.removeEventListener("focus", handleWindowFocus);
        };
    }, [locationPath, autoRefreshEnabled]);

    return {
        posts,
        activityLoading,
        activityError,
    };
};

export default useAdminLayoutData;
