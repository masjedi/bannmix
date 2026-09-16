import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import publicTranslations from "../../i18n/publicTranslations";

const ThemeToggle = ({ className = "" }) => {
    const { toggleTheme, isDark } = useTheme();
    const { translate } = useLanguage();

    const label = isDark
        ? translate(publicTranslations.header.switchToLight)
        : translate(publicTranslations.header.switchToDark);

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            aria-pressed={isDark}
            className={["icon-btn h-10 w-10 focus-visible:outline-theme-focus-ring", className]
                .filter(Boolean)
                .join(" ")}
        >
            {isDark ? (
                <Sun size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
                <Moon size={16} strokeWidth={2} aria-hidden="true" />
            )}
            <span className="sr-only">{label}</span>
        </button>
    );
};

export default ThemeToggle;
