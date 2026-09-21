import api from "./axios";

const buildProductFormData = (payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (key === "gallery_images") {
            if (Array.isArray(value)) {
                value.forEach((file) => {
                    if (file instanceof File) {
                        formData.append("gallery_images[]", file);
                    }
                });
            }

            return;
        }

        if (key === "main_image") {
            if (value instanceof File) {
                formData.append("main_image", value);
            }

            return;
        }

        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return formData;
};

export const postsApi = {
    getPosts: async (params = {}, config = {}) => {
        const response = await api.get("/posts", { params, ...config });
        return response.data;
    },

    getPostStats: async (config = {}) => {
        const response = await api.get(
            "/posts",
            { params: { stats_only: 1 }, ...config }
        );
        return response.data?.meta?.stats ?? null;
    },

    getPost: async (id) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },

    createPost: async (payload) => {
        const formData = buildProductFormData(payload);

        const response = await api.post("/posts", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    updatePost: async (id, payload) => {
        const hasFiles =
            payload?.main_image instanceof File ||
            payload?.gallery_images?.some?.((file) => file instanceof File);

        if (hasFiles) {
            const formData = buildProductFormData({
                ...payload,
                _method: "PUT",
            });

            const response = await api.post(`/posts/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        }

        const response = await api.put(`/posts/${id}`, payload);
        return response.data;
    },

    deletePost: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    },
};
