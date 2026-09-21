import api from "./axios";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

export const siteFeedbackApi = {
    getFeedback: async (params = {}) => {
        const response = await api.get("/admin/feedback", {
            params: cleanParams(params),
        });

        return response.data;
    },

    getApprovedFeedback: async (params = {}) => {
        const response = await api.get("/public/feedback", {
            params: cleanParams(params),
        });
        const payload = response.data;

        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        if (Array.isArray(payload?.data?.data)) {
            return payload.data.data;
        }

        return [];
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/admin/feedback/${id}/status`, {
            status,
        });

        return response.data;
    },

    deleteFeedback: async (id) => {
        const response = await api.delete(`/admin/feedback/${id}`);

        return response.data;
    },
};

export default siteFeedbackApi;
