import axios from "axios";

const defaultApiBase =
    import.meta.env.DEV && !import.meta.env.VITE_API_URL
        ? "/api"
        : "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        defaultApiBase,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (
        typeof FormData !== "undefined" &&
        config.data instanceof FormData
    ) {
        config.headers.delete("Content-Type");
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
