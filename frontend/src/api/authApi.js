import api from "./axios";

export const loginAdmin = (payload) => {
    return api.post("/login", payload);
};

export const logoutAdmin = () => {
    return api.post("/logout");
};

// Backward-compatible aliases used by AuthContext
export const loginClient = loginAdmin;
export const logoutClient = logoutAdmin;
