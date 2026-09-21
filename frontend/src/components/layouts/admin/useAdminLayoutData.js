import { useCallback, useEffect, useState } from "react";

import { postsApi } from "../../../api/postsApi";

import { getErrorMessage, normalizeList } from "./adminLayoutUtils";

const useAdminLayoutData = ({ autoRefreshEnabled }) => {
    const [posts, setPosts] = useState([]);
    const [postStats, setPostStats] = useState(null);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState("");
    const [quickSearchPostsLoaded, setQuickSearchPostsLoaded] = useState(false);

    const fetchPostStats = useCallback(async (options = {}) => {
        const { signal } = options;

        try {
            const stats = await postsApi.getPostStats(
                signal ? { signal } : undefined
            );
            setPostStats(stats);
        } catch (error) {
            if (error?.code === "ERR_CANCELED") {
                return;
            }

            throw error;
        }
    }, []);

    const fetchQuickSearchPosts = useCallback(async (options = {}) => {
        const { signal } = options;

        if (quickSearchPostsLoaded) {
            return;
        }

        try {
            const postsResult = await postsApi.getPosts(
                {
                    per_page: 100,
                    compact: 1,
                },
                signal ? { signal } : undefined
            );

            setPosts(normalizeList(postsResult));
            setQuickSearchPostsLoaded(true);
        } catch (error) {
            if (error?.code === "ERR_CANCELED") {
                return;
            }

            throw error;
        }
    }, [quickSearchPostsLoaded]);

    const fetchAdminData = useCallback(async (options = {}) => {
        const { signal } = options;

        try {
            setActivityLoading(true);
            setActivityError("");

            await fetchPostStats({ signal });
        } catch (error) {
            if (error?.code === "ERR_CANCELED") {
                return;
            }

            setActivityError(
                getErrorMessage(error, "Failed to load products.")
            );
        } finally {
            setActivityLoading(false);
        }
    }, [fetchPostStats]);

    useEffect(() => {
        const controller = new AbortController();
        let refreshInterval = null;

        fetchAdminData({ signal: controller.signal });

        if (autoRefreshEnabled) {
            refreshInterval = window.setInterval(() => {
                fetchAdminData();
            }, 30000);
        }

        const handleWindowFocus = () => {
            fetchAdminData();
        };

        window.addEventListener("focus", handleWindowFocus);

        return () => {
            controller.abort();

            if (refreshInterval) {
                window.clearInterval(refreshInterval);
            }

            window.removeEventListener("focus", handleWindowFocus);
        };
    }, [autoRefreshEnabled, fetchAdminData]);

    return {
        posts,
        postStats,
        activityLoading,
        activityError,
        refetchPosts: fetchAdminData,
        loadQuickSearchPosts: fetchQuickSearchPosts,
    };
};

export default useAdminLayoutData;
