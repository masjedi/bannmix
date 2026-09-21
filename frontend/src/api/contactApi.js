import api from "./axios";

export const contactApi = {
    submitMessage: async (payload) => {
        const response = await api.post("/public/contact-messages", payload);

        return response.data;
    },
};

export default contactApi;
