import { ArrowRight } from "lucide-react";

import { hasText } from "./about/aboutUtils";
import { ButtonLink, Container, FadeUp, PageSection } from "./ui";

const ProductsCtaSection = ({
    label,
    title,
    description,
    primaryCtaText,
    primaryCtaUrl = "/products",
    secondaryCtaText,
    secondaryCtaUrl,
    pageEnd = true,
}) => {
    if (!hasText(title) && !hasText(description)) return null;

    const showPrimary = hasText(primaryCtaText);
    const showSecondary =
        hasText(secondaryCtaText) && hasText(secondaryCtaUrl);

    return (
        <PageSection
            pad={false}
            className={[
                "products-cta",
                pageEnd ? "products-cta-page-end" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <Container>
                <FadeUp>
                    <div className="products-cta-panel">
                        {hasText(label) ? (
                            <p className="products-cta-label">{label}</p>
                        ) : null}

                        {hasText(title) ? (
                            <h2
                                className={[
                                    "products-cta-title",
                                    hasText(label) ? "mt-3" : "",
                                ].join(" ")}
                            >
                                {title}
                            </h2>
                        ) : null}

                        {hasText(description) ? (
                            <p className="products-cta-body mt-4">
                                {description}
                            </p>
                        ) : null}

                        {showPrimary || showSecondary ? (
                            <div className="products-cta-actions mt-7">
                                {showPrimary ? (
                                    <ButtonLink to={primaryCtaUrl}>
                                        {primaryCtaText}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </ButtonLink>
                                ) : null}

                                {showSecondary ? (
                                    <a
                                        href={secondaryCtaUrl}
                                        className="products-cta-contact"
                                    >
                                        {secondaryCtaText}
                                    </a>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </FadeUp>
            </Container>
        </PageSection>
    );
};

export default ProductsCtaSection;
