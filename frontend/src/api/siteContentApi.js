import api from "./axios";

const isFormData = (payload) => {
    return typeof FormData !== "undefined" && payload instanceof FormData;
};

const prepareUpdateFormData = (payload) => {
    if (!payload.has("_method")) {
        payload.append("_method", "PATCH");
    }

    return payload;
};

export const siteContentApi = {
    /**
     * Admin: retrieve multilingual website content.
     *
     * Supported params:
     * page
     * section
     * is_active
     * search
     * per_page
     * page number
     */
    getContents(params = {}) {
        return api.get("/admin/site-contents", {
            params,
        });
    },

    /**
     * Admin: retrieve one content record.
     */
    getContent(id) {
        return api.get(`/admin/site-contents/${id}`);
    },

    /**
     * Admin: create content.
     *
     * Supports plain JSON objects and FormData.
     */
    createContent(payload) {
        return api.post("/admin/site-contents", payload);
    },

    /**
     * Admin: update content.
     *
     * Laravel/PHP does not always parse uploaded files correctly
     * from multipart PUT/PATCH requests. For FormData, this sends
     * POST with Laravel's _method=PATCH override.
     */
    updateContent(id, payload) {
        if (isFormData(payload)) {
            return api.post(
                `/admin/site-contents/${id}`,
                prepareUpdateFormData(payload)
            );
        }

        return api.patch(`/admin/site-contents/${id}`, payload);
    },

    /**
     * Admin: activate or deactivate content.
     */
    updateContentStatus(id, isActive) {
        return api.patch(`/admin/site-contents/${id}/status`, {
            is_active: Boolean(isActive),
        });
    },

    /**
     * Admin: update content ordering.
     *
     * Example:
     * [
     *   { id: 1, sort_order: 0 },
     *   { id: 2, sort_order: 1 }
     * ]
     */
    reorderContents(items) {
        return api.patch("/admin/site-contents/reorder", {
            items,
        });
    },

    /**
     * Admin: delete content.
     */
    deleteContent(id) {
        return api.delete(`/admin/site-contents/${id}`);
    },

    /**
     * Public: retrieve localized content for one page.
     *
     * Examples:
     * getPublicPage("home", { lang: "en" })
     * getPublicPage("home", {
     *     lang: "ps",
     *     section: "banners",
     * })
     */
    getPublicPage(page, params = {}, config = {}) {
        return api.get(`/public/content/${page}`, {
            params,
            ...config,
        });
    },
};

export default siteContentApi;
