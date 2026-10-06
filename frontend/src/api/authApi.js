import api from "./axios";

export const forgotPassword = () => api.post("/forgot-password", {});

export const resetPassword = (payload) =>
    api.post("/reset-password", payload);
