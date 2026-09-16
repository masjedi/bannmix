import { useEffect, useRef, useState } from "react";



import { Link } from "react-router-dom";



export const Container = ({ children, className = "" }) => (

    <div

        className={`mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 ${className}`}

    >

        {children}

    </div>

);



export const PublicPage = ({ children, className = "" }) => (

    <main className={`public-page ${className}`}>{children}</main>

);



export const PageSection = ({

    children,

    className = "",

    pad = true,

    border = false,

    id,

}) => (

    <section

        id={id}

        className={[

            "page-section",

            pad && "section-pad",

            border && "border-b border-line",

            className,

        ]

            .filter(Boolean)

            .join(" ")}

    >

        {children}

    </section>

);



export const PublicCard = ({

    children,

    className = "",

    hover = false,

    padding = true,

    as: Tag = "div",

    ...props

}) => (

    <Tag

        className={[

            "public-card",

            hover && "public-card-hover",

            !padding && "!p-0",

            className,

        ]

            .filter(Boolean)

            .join(" ")}

        {...props}

    >

        {children}

    </Tag>

);



export const SectionLabel = ({ children, className = "" }) => (

    <p

        className={`text-[12px] font-bold uppercase tracking-[0.16em] text-brand-orange ${className}`}

    >

        {children}

    </p>

);



export const SectionMark = ({ index, label, className = "" }) => (

    <div className={`mb-5 flex items-center gap-3 ${className}`}>

        {index ? (

            <span className="font-mono text-xs font-bold tracking-[0.2em] text-brand-orange">

                {index}

            </span>

        ) : null}

        {index ? <span className="h-px w-10 bg-line" /> : null}

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-content-muted">

            {label}

        </span>

    </div>

);



export const SectionHeading = ({

    label,

    title,

    description,

    align = "left",

    className = "",

}) => (

    <div

        className={[

            align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",

            className,

        ].join(" ")}

    >

        {label && <SectionLabel>{label}</SectionLabel>}

        <h2

            className={[

                "text-[clamp(1.75rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-content",

                label ? "mt-3" : "",

            ].join(" ")}

        >

            {title}

        </h2>

        {description && (

            <p className="mt-4 text-base leading-7 text-content-secondary sm:text-lg sm:leading-8">

                {description}

            </p>

        )}

    </div>

);



export const PageHero = ({

    label,

    title,

    description,

    children,

    image,

    imageAlt = "",

    className = "",

}) => (

    <section className={`relative isolate overflow-hidden ${className}`}>

        {image ? (

            <>

                <img

                    src={image}

                    alt={imageAlt}

                    className="absolute inset-0 h-full w-full object-cover"

                />

                <div className="absolute inset-0 bg-gradient-to-r from-theme-page/90 via-theme-page/75 to-theme-page/40" />

            </>

        ) : null}



        <Container className="relative py-16 sm:py-20 lg:py-24">

            {label && <SectionLabel>{label}</SectionLabel>}

            <h1

                className={[

                    "max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl",

                    image ? "text-white" : "text-content",

                    label ? "mt-4" : "",

                ].join(" ")}

            >

                {title}

            </h1>

            {description && (

                <p

                    className={[

                        "mt-4 max-w-xl text-base leading-7 sm:text-lg",

                        image

                            ? "text-white/80"

                            : "text-content-secondary",

                    ].join(" ")}

                >

                    {description}

                </p>

            )}

            {children}

        </Container>

    </section>

);



export const PageIntro = ({ index, label, title, description, children }) => (

    <PageSection>

        <Container className="relative py-4 sm:py-6 lg:py-8">

            <SectionMark index={index} label={label} />

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-content sm:text-5xl lg:text-6xl">

                {title}

            </h1>

            {description && (

                <p className="mt-6 max-w-2xl text-base leading-7 text-content-secondary sm:text-lg sm:leading-8">

                    {description}

                </p>

            )}

            {children}

        </Container>

    </PageSection>

);



const buttonVariants = {

    primary: "btn-primary",

    secondary: "btn-secondary",

    outline: "btn-outline",

    darkSecondary: "btn-dark-secondary",

};



export const ButtonLink = ({

    to,

    href,

    variant = "primary",

    className = "",

    children,

    external = false,

    ...props

}) => {

    const classes = `${buttonVariants[variant] || buttonVariants.primary} ${className}`;



    if (href) {

        return (

            <a

                href={href}

                className={classes}

                {...(external

                    ? { target: "_blank", rel: "noreferrer noopener" }

                    : {})}

                {...props}

            >

                {children}

            </a>

        );

    }



    return (

        <Link to={to || "/"} className={classes} {...props}>

            {children}

        </Link>

    );

};



export const FadeUp = ({

    children,

    className = "",

    delay = 0,

    as: Tag = "div",

}) => {

    const ref = useRef(null);

    const [visible, setVisible] = useState(false);



    useEffect(() => {

        const node = ref.current;

        if (!node) return undefined;



        const reduceMotion = window.matchMedia(

            "(prefers-reduced-motion: reduce)"

        ).matches;



        if (reduceMotion) {

            setVisible(true);

            return undefined;

        }



        const observer = new IntersectionObserver(

            ([entry]) => {

                if (entry.isIntersecting) {

                    setVisible(true);

                    observer.disconnect();

                }

            },

            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }

        );



        observer.observe(node);

        return () => observer.disconnect();

    }, []);



    return (

        <Tag

            ref={ref}

            className={className}

            style={{

                opacity: visible ? 1 : 0,

                transform: visible ? "none" : "translateY(18px)",

                transition:

                    "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",

                transitionDelay: visible ? `${delay}ms` : "0ms",

            }}

        >

            {children}

        </Tag>

    );

};



export default {

    Container,

    PublicPage,

    PageSection,

    PublicCard,

    SectionLabel,

    SectionMark,

    SectionHeading,

    PageHero,

    PageIntro,

    ButtonLink,

    FadeUp,

};

