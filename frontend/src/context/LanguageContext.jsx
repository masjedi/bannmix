import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const LANGUAGE_STORAGE_KEY = "banmix-language";

export const SUPPORTED_LANGUAGES = [
    {
        code: "en",
        name: "English",
        nativeName: "English",
        direction: "ltr",
    },
    {
        code: "ps",
        name: "Pashto",
        nativeName: "پښتو",
        direction: "rtl",
    },
    {
        code: "fa",
        name: "Dari",
        nativeName: "دری",
        direction: "rtl",
    },
];

const LanguageContext = createContext(null);

const normalizeLanguage = (value) => {
    const languageCode = String(value || "")
        .trim()
        .toLowerCase()
        .split("-")[0];

    const isSupported = SUPPORTED_LANGUAGES.some(
        (language) => language.code === languageCode
    );

    return isSupported ? languageCode : "en";
};

const getInitialLanguage = () => {
    if (typeof window === "undefined") {
        return "en";
    }

    try {
        const storedLanguage =
            window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (storedLanguage) {
            return normalizeLanguage(storedLanguage);
        }
    } catch {
        // Ignore unavailable localStorage.
    }

    return normalizeLanguage(
        window.navigator?.language || window.navigator?.languages?.[0] || "en"
    );
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(getInitialLanguage);

    const currentLanguage = useMemo(() => {
        return (
            SUPPORTED_LANGUAGES.find((item) => item.code === language) ||
            SUPPORTED_LANGUAGES[0]
        );
    }, [language]);

    const direction = currentLanguage.direction;
    const isRtl = direction === "rtl";

    const setLanguage = useCallback((nextLanguage) => {
        setLanguageState(normalizeLanguage(nextLanguage));
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch {
            // Ignore unavailable localStorage.
        }

        document.documentElement.lang = language;
        document.documentElement.dir = direction;
        document.documentElement.dataset.language = language;

        document.body.dir = direction;
    }, [language, direction]);

    /**
     * Return the correct language from a multilingual value.
     *
     * Supported input:
     * {
     *     en: "About BanMix",
     *     ps: "د بڼمیکس په اړه",
     *     fa: "درباره بڼمیکس"
     * }
     *
     * A plain string is returned unchanged.
     */
    const translate = useCallback(
        (value, fallback = "") => {
            if (value === null || value === undefined) {
                return fallback;
            }

            if (typeof value === "string") {
                return value;
            }

            if (typeof value !== "object" || Array.isArray(value)) {
                return String(value);
            }

            const requestedTranslation = value[language];

            if (
                typeof requestedTranslation === "string" &&
                requestedTranslation.trim() !== ""
            ) {
                return requestedTranslation;
            }

            const englishTranslation = value.en;

            if (
                typeof englishTranslation === "string" &&
                englishTranslation.trim() !== ""
            ) {
                return englishTranslation;
            }

            const firstAvailableTranslation = Object.values(value).find(
                (translation) =>
                    typeof translation === "string" && translation.trim() !== ""
            );

            return firstAvailableTranslation || fallback;
        },
        [language]
    );

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            currentLanguage,
            languages: SUPPORTED_LANGUAGES,
            direction,
            isRtl,
            translate,
        }),
        [language, setLanguage, currentLanguage, direction, isRtl, translate]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used inside LanguageProvider.");
    }

    return context;
};

export default LanguageContext;
