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

            <div className={[
                "mt-8 grid gap-4 sm:grid-cols-2",
                audiences.length === 1 ? "lg:grid-cols-1" :
                audiences.length === 2 ? "lg:grid-cols-2" :
                audiences.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
            ].join(" ")}>
                {audiences.map((item, index) => {
                    const Icon = resolveHomeIcon(item.icon);

                    return (
                        <FadeUp key={item.title} delay={index * 60} className="min-w-0">
                            <PublicCard
                                hover
                                className="flex h-full min-w-0 flex-col"
                            >
                                <span className="home-info-icon">
                                    <Icon
                                        size={18}
                                        strokeWidth={1.75}
                                        aria-hidden="true"
                                    />
                                </span>
                                <h3
                                    className="mt-4 min-h-[3.5rem] line-clamp-2 break-words text-lg font-bold leading-7 text-content"
                                    title={item.title}
                                >
                                    {item.title}
                                </h3>
                                <p
                                    className="mt-2 min-h-[6rem] line-clamp-4 break-words text-sm leading-6 text-content-secondary"
                                    title={item.body}
                                >
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
