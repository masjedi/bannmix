import api from "./axios";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

export const notificationsApi = {
    getNotifications: async (params = {}) => {
        const response = await api.get("/admin/notifications", {
            params: cleanParams(params),
        });

        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get("/admin/notifications/unread-count");

        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.patch(`/admin/notifications/${id}/read`);

        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch("/admin/notifications/read-all");

        return response.data;
    },
};

export default notificationsApi;
