import { useCallback, useEffect, useMemo, useState } from "react";

import siteContentApi from "../api/siteContentApi";
import { useLanguage } from "../context/LanguageContext";
import { fetchPublicPageWithCache } from "../utils/publicContentCache";

const EMPTY_PAGE_DATA = {
    page: "",
    locale: "en",
    direction: "ltr",
    sections: {},
    items: [],
    includes: {},
};

/**
 * Supports both possible Axios response structures:
 *
 * response.data
 * response.data.data
 */
const extractPageData = (response) => {
    const firstLevel = response?.data ?? response;

    const payload =
        firstLevel?.data && !firstLevel?.sections && !firstLevel?.items
            ? firstLevel.data
            : firstLevel;

    return {
        page: payload?.page ?? "",
        locale: payload?.locale ?? "en",
        direction: payload?.direction ?? "ltr",
        sections: payload?.sections ?? {},
        items: Array.isArray(payload?.items) ? payload.items : [],
        includes: payload?.includes ?? {},
    };
};

const getErrorMessage = (error) => {
    if (error?.code === "ERR_CANCELED") {
        return "";
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load website content."
    );
};

const usePublicPageContent = (page, options = {}) => {
    const { language } = useLanguage();

    const { section = "", enabled = true } = options;

    const [pageData, setPageData] = useState(EMPTY_PAGE_DATA);
    const [loading, setLoading] = useState(Boolean(enabled));
    const [error, setError] = useState("");

    const fetchContent = useCallback(
        async ({ bypassCache = false, signal } = {}) => {
            if (!enabled || !page) {
                setPageData(EMPTY_PAGE_DATA);
                setLoading(false);
                setError("");

                return null;
            }

            setLoading(true);
            setError("");

            const params = { lang: language };

            if (section) {
                params.section = section;
            }

            try {
                const fetcher = async ({ signal: requestSignal }) => {
                    const response = await siteContentApi.getPublicPage(
                        page,
                        params,
                        { signal: requestSignal }
                    );

                    return extractPageData(response);
                };

                const normalizedData = bypassCache
                    ? await fetcher({ signal })
                    : await fetchPublicPageWithCache({
                          page,
                          language,
                          section,
                          signal,
                          fetcher,
                      });

                setPageData(normalizedData);

                return normalizedData;
            } catch (requestError) {
                const message = getErrorMessage(requestError);

                if (message) {
                    setError(message);
                }

                return null;
            } finally {
                setLoading(false);
            }
        },
        [enabled, language, page, section]
    );

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        const loadContent = async () => {
            if (!enabled || !page) {
                if (active) {
                    setPageData(EMPTY_PAGE_DATA);
                    setLoading(false);
                    setError("");
                }

                return;
            }

            if (active) {
                setLoading(true);
                setError("");
            }

            const params = { lang: language };

            if (section) {
                params.section = section;
            }

            try {
                const normalizedData = await fetchPublicPageWithCache({
                    page,
                    language,
                    section,
                    signal: controller.signal,
                    fetcher: async ({ signal }) => {
                        const response = await siteContentApi.getPublicPage(
                            page,
                            params,
                            { signal }
                        );

                        return extractPageData(response);
                    },
                });

                if (!active) {
                    return;
                }

                setPageData(normalizedData);
            } catch (requestError) {
                if (!active || requestError?.code === "ERR_CANCELED") {
                    return;
                }

                setError(getErrorMessage(requestError));
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadContent();

        return () => {
            active = false;
            controller.abort();
        };
    }, [enabled, language, page, section]);

    const getSection = useCallback(
        (sectionName) => {
            const content = pageData.sections?.[sectionName];

            return Array.isArray(content) ? content : [];
        },
        [pageData.sections]
    );

    const getFirstSectionItem = useCallback(
        (sectionName) => {
            return getSection(sectionName)[0] ?? null;
        },
        [getSection]
    );

    const getItemByKey = useCallback(
        (contentKey) => {
            if (!contentKey) {
                return null;
            }

            return (
                pageData.items.find(
                    (item) => item.content_key === contentKey
                ) ?? null
            );
        },
        [pageData.items]
    );

    const getIncludedSection = useCallback(
        (includePage, sectionName) => {
            const content =
                pageData.includes?.[includePage]?.sections?.[sectionName];

            return Array.isArray(content) ? content : [];
        },
        [pageData.includes]
    );

    return useMemo(
        () => ({
            page: pageData.page,
            locale: pageData.locale,
            direction: pageData.direction,
            sections: pageData.sections,
            items: pageData.items,
            includes: pageData.includes,

            loading,
            error,

            refetch: () => fetchContent({ bypassCache: true }),
            getSection,
            getFirstSectionItem,
            getItemByKey,
            getIncludedSection,
        }),
        [
            pageData,
            loading,
            error,
            fetchContent,
            getSection,
            getFirstSectionItem,
            getItemByKey,
            getIncludedSection,
        ]
    );
};

export default usePublicPageContent;
