import { useEffect, useRef, useState } from "react";

import { Check, ChevronDown, Globe2 } from "lucide-react";



import { useLanguage } from "../../context/LanguageContext";



const LanguageSwitcher = ({ compact = false, className = "" }) => {

    const { language, setLanguage, currentLanguage, languages } = useLanguage();



    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);



    useEffect(() => {

        if (!open) {

            return undefined;

        }



        const handleClickOutside = (event) => {

            if (

                containerRef.current &&

                !containerRef.current.contains(event.target)

            ) {

                setOpen(false);

            }

        };



        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                setOpen(false);

            }

        };



        document.addEventListener("mousedown", handleClickOutside);

        window.addEventListener("keydown", handleKeyDown);



        return () => {

            document.removeEventListener("mousedown", handleClickOutside);

            window.removeEventListener("keydown", handleKeyDown);

        };

    }, [open]);



    const handleLanguageChange = (languageCode) => {

        setLanguage(languageCode);

        setOpen(false);

    };



    return (

        <div ref={containerRef} className={`relative ${className}`}>

            <button

                type="button"

                onClick={() => setOpen((current) => !current)}

                aria-label="Change website language"

                aria-haspopup="listbox"

                aria-expanded={open}

                className={[

                    "icon-btn inline-flex h-10 items-center gap-2 px-3 text-sm font-semibold shadow-sm",

                    open ? "border-brand-orange text-brand-orange" : "",

                    "focus-visible:outline-theme-focus-ring",

                ].join(" ")}

            >

                <Globe2 size={16} />

                {!compact && (

                    <span className="whitespace-nowrap">

                        {currentLanguage.nativeName}

                    </span>

                )}

                <ChevronDown

                    size={14}

                    className={`transition-transform duration-200 ${

                        open ? "rotate-180" : ""

                    }`}

                />

            </button>



            {open && (

                <div

                    role="listbox"

                    aria-label="Available languages"

                    className="absolute end-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl bg-theme-surface-elevated p-1.5 shadow-card"

                >

                    {languages.map((item) => {

                        const selected = item.code === language;



                        return (

                            <button

                                key={item.code}

                                type="button"

                                role="option"

                                aria-selected={selected}

                                onClick={() => handleLanguageChange(item.code)}

                                className={[

                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition",

                                    selected

                                        ? "bg-brand-orange/10 font-semibold text-brand-orange"

                                        : "text-content hover:bg-theme-surface-soft",

                                ].join(" ")}

                            >

                                <span

                                    className="min-w-0 flex-1"

                                    dir={item.direction}

                                >

                                    <span className="block">

                                        {item.nativeName}

                                    </span>

                                    {item.nativeName !== item.name && (

                                        <span className="mt-0.5 block text-[11px] font-normal text-content-muted">

                                            {item.name}

                                        </span>

                                    )}

                                </span>

                                {selected && (

                                    <Check size={15} className="shrink-0" />

                                )}

                            </button>

                        );

                    })}

                </div>

            )}

        </div>

    );

};



export default LanguageSwitcher;

