import api from "./axios";

const cleanParams = (params = {}) => {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );
};

export const publicProductsApi = {
    getProducts: async (params = {}, config = {}) => {
        const response = await api.get("/public/products", {
            params: cleanParams(params),
            ...config,
        });

        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/public/products/${id}`);

        return response.data;
    },
};
