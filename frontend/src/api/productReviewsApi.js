import api from "./axios";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

export const productReviewsApi = {
    getProductReviews: async (productId, params = {}) => {
        const response = await api.get(`/public/products/${productId}/reviews`, {
            params: cleanParams(params),
        });

        return response.data;
    },

    submitReview: async (productId, payload) => {
        const response = await api.post(`/public/products/${productId}/reviews`, payload);

        return response.data;
    },

    getAdminPostReviews: async (postId, params = {}) => {
        const response = await api.get(`/posts/${postId}/reviews`, {
            params: cleanParams(params),
        });

        return response.data;
    },

    updateReviewStatus: async (reviewId, status) => {
        const response = await api.patch(`/product-reviews/${reviewId}/status`, {
            status,
        });

        return response.data;
    },

    deleteReview: async (reviewId) => {
        const response = await api.delete(`/product-reviews/${reviewId}`);

        return response.data;
    },
};

export default productReviewsApi;
