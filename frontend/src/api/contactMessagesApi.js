import api from "./axios";

export const contactMessagesApi = {
    getMessages: async (params = {}) => {
        const response = await api.get("/admin/contact-messages", { params });

        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.patch(`/admin/contact-messages/${id}/read`);

        return response.data;
    },
};

export default contactMessagesApi;
