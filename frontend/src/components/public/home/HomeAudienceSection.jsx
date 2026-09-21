import {
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    SectionHeading,
} from "../ui";
import { resolveHomeIcon } from "./homeUtils";

const HomeAudienceSection = ({
    label,
    title,
    description,
    audiences = [],
}) => (
    <PageSection
        id="who-we-serve"
        border={false}
        className="home-audience home-section-compact"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                    description={description}
                />
            </FadeUp>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {audiences.map((item, index) => {
                    const Icon = resolveHomeIcon(item.icon);

                    return (
                        <FadeUp key={item.title} delay={index * 60}>
                            <PublicCard
                                hover
                                className="flex h-full flex-col"
                            >
                                <span className="home-info-icon">
                                    <Icon
                                        size={18}
                                        strokeWidth={1.75}
                                        aria-hidden="true"
                                    />
                                </span>
                                <h3 className="mt-4 text-lg font-bold text-content">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-content-secondary">
                                    {item.body}
                                </p>
                            </PublicCard>
                        </FadeUp>
                    );
                })}
            </div>
        </Container>
    </PageSection>
);

export default HomeAudienceSection;
