import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = useCallback((userData) => {
        if (!userData) return null;

        return {
            ...userData,
            role: userData.role || userData.type,
        };
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const normalizedUser = normalizeUser(parsedUser);
                setUser(normalizedUser);
                localStorage.setItem("user", JSON.stringify(normalizedUser));
            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            }
        }

        setLoading(false);
    }, [normalizeUser]);

    const login = useCallback(async (credentials) => {
        const response = await api.post("/login", credentials);

        const token = response.data.token || response.data.access_token;
        const userData = response.data.user;

        if (!token || !userData) {
            throw new Error("Invalid login response.");
        }

        const normalizedUser = normalizeUser(userData);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        setUser(normalizedUser);

        return normalizedUser;
    }, [normalizeUser]);

    const logout = useCallback(async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            isAuthenticated: Boolean(user),
        }),
        [user, loading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
