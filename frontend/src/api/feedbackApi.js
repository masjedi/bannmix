import api from "./axios";

const extractRecords = (payload) => {
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
};

export const feedbackApi = {
    submitFeedback: async (payload) => {
        const response = await api.post("/public/feedback", payload);

        return response.data;
    },

    getApproved: async (params = {}, config = {}) => {
        const response = await api.get("/public/feedback", {
            params,
            ...config,
        });

        return extractRecords(response.data);
    },
};

export default feedbackApi;
