import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const THEME_STORAGE_KEY = "banmix-theme";

export const THEMES = {
    light: "light",
    dark: "dark",
};

const getSystemTheme = () => {
    if (typeof window === "undefined") {
        return THEMES.light;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEMES.dark
        : THEMES.light;
};

const normalizeTheme = (value) => {
    return value === THEMES.dark ? THEMES.dark : THEMES.light;
};

const getInitialTheme = () => {
    if (typeof window === "undefined") {
        return THEMES.light;
    }

    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === THEMES.light || stored === THEMES.dark) {
            return stored;
        }
    } catch {
        // Ignore unavailable localStorage.
    }

    return getSystemTheme();
};

const applyThemeClass = (theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === THEMES.dark);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(getInitialTheme);

    const setTheme = useCallback((nextTheme) => {
        setThemeState(normalizeTheme(nextTheme));
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) =>
            current === THEMES.dark ? THEMES.light : THEMES.dark
        );
    }, []);

    useEffect(() => {
        applyThemeClass(theme);

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore unavailable localStorage.
        }
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            isDark: theme === THEMES.dark,
            isLight: theme === THEMES.light,
        }),
        [theme, setTheme, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider.");
    }

    return context;
};

export default ThemeContext;
