import { MessageCircle } from "lucide-react";

import { ButtonLink, Container, FadeUp, PageSection, SectionHeading } from "../ui";

const HomeOrderingSection = ({
    label,
    title,
    description,
    note,
    steps = [],
    whatsappHref,
    whatsappLabel,
}) => (
    <PageSection
        id="wholesale-process"
        border={false}
        className="home-process home-section-compact home-section-soft"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                    description={description}
                />
            </FadeUp>

            <ol className="home-process-grid mt-8 sm:mt-10">
                {steps.map((item, index) => (
                    <FadeUp
                        key={item.step}
                        as="li"
                        delay={index * 70}
                        className="home-process-step"
                    >
                        <p className="home-process-number">{item.step}</p>
                        <h3 className="home-process-title">{item.title}</h3>
                        <p className="home-process-body">{item.body}</p>
                    </FadeUp>
                ))}
            </ol>

            <FadeUp delay={220} className="mt-8 flex flex-col gap-3 sm:mt-10">
                {note ? (
                    <p className="max-w-2xl text-sm leading-6 text-content-muted">
                        {note}
                    </p>
                ) : null}

                {whatsappHref ? (
                    <div>
                        <ButtonLink
                            href={whatsappHref}
                            external
                            variant="primary"
                            className="h-[52px] w-full px-6 sm:w-auto"
                        >
                            <MessageCircle size={16} aria-hidden="true" />
                            {whatsappLabel}
                        </ButtonLink>
                    </div>
                ) : null}
            </FadeUp>
        </Container>
    </PageSection>
);

export default HomeOrderingSection;
