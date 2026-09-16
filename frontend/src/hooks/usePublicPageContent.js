import { useCallback, useEffect, useMemo, useState } from "react";

import siteContentApi from "../api/siteContentApi";
import { useLanguage } from "../context/LanguageContext";

const EMPTY_PAGE_DATA = {
    page: "",
    locale: "en",
    direction: "ltr",
    sections: {},
    items: [],
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
    };
};

const getErrorMessage = (error) => {
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

    const fetchContent = useCallback(async () => {
        if (!enabled || !page) {
            setPageData(EMPTY_PAGE_DATA);
            setLoading(false);
            setError("");

            return null;
        }

        setLoading(true);
        setError("");

        try {
            const params = {
                lang: language,
            };

            if (section) {
                params.section = section;
            }

            const response = await siteContentApi.getPublicPage(page, params);

            const normalizedData = extractPageData(response);

            setPageData(normalizedData);

            return normalizedData;
        } catch (requestError) {
            setError(getErrorMessage(requestError));

            return null;
        } finally {
            setLoading(false);
        }
    }, [enabled, language, page, section]);

    useEffect(() => {
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

            try {
                const params = {
                    lang: language,
                };

                if (section) {
                    params.section = section;
                }

                const response = await siteContentApi.getPublicPage(
                    page,
                    params
                );

                if (!active) {
                    return;
                }

                setPageData(extractPageData(response));
            } catch (requestError) {
                if (!active) {
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

    return useMemo(
        () => ({
            page: pageData.page,
            locale: pageData.locale,
            direction: pageData.direction,
            sections: pageData.sections,
            items: pageData.items,

            loading,
            error,

            refetch: fetchContent,
            getSection,
            getFirstSectionItem,
            getItemByKey,
        }),
        [
            pageData,
            loading,
            error,
            fetchContent,
            getSection,
            getFirstSectionItem,
            getItemByKey,
        ]
    );
};

export default usePublicPageContent;
