import { MessageCircle } from "lucide-react";

import Accordion from "../Accordion";
import { ButtonLink, Container, FadeUp, PageSection, SectionHeading } from "../ui";

const HomeFaqSection = ({
    label,
    title,
    description,
    helpLabel,
    whatsappLabel,
    whatsappHref,
    items = [],
}) => (
    <PageSection
        id="faq"
        border={false}
        className="home-faq home-section-compact"
    >
        <Container>
            <div className="home-faq-layout">
                <FadeUp className="home-faq-intro">
                    <SectionHeading
                        label={label}
                        title={title}
                        description={description}
                    />

                    {whatsappHref ? (
                        <div className="home-faq-cta">
                            {helpLabel ? (
                                <p className="home-faq-help">{helpLabel}</p>
                            ) : null}
                            <ButtonLink
                                href={whatsappHref}
                                external
                                variant="secondary"
                                className="h-11 px-5"
                            >
                                <MessageCircle size={16} aria-hidden="true" />
                                {whatsappLabel}
                            </ButtonLink>
                        </div>
                    ) : null}
                </FadeUp>

                <FadeUp delay={80} className="home-faq-list">
                    <Accordion items={items} />
                </FadeUp>
            </div>
        </Container>
    </PageSection>
);

export default HomeFaqSection;
