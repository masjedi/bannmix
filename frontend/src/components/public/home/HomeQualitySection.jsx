import {
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    SectionHeading,
} from "../ui";
import { resolveHomeIcon } from "./homeUtils";

const HomeQualitySection = ({
    label,
    title,
    ingredients = [],
    points = [],
}) => (
    <PageSection
        id="ingredients-quality"
        border={false}
        className="home-quality home-section-compact home-section-soft"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                />
            </FadeUp>

            {ingredients.length > 0 ? (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {ingredients.map((item, index) => (
                        <FadeUp
                            key={item.title}
                            as="li"
                            delay={index * 50}
                        >
                            <PublicCard className="h-full">
                                <h3 className="text-base font-bold text-content">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-content-secondary">
                                    {item.body}
                                </p>
                            </PublicCard>
                        </FadeUp>
                    ))}
                </ul>
            ) : null}

            {points.length > 0 ? (
                <ul className="home-quality-points mt-8">
                    {points.map((item, index) => {
                        const Icon = resolveHomeIcon(item.icon);

                        return (
                            <FadeUp
                                key={item.title}
                                as="li"
                                delay={80 + index * 50}
                                className="home-quality-point"
                            >
                                <span className="home-info-icon">
                                    <Icon
                                        size={18}
                                        strokeWidth={1.75}
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <h3 className="text-[15px] font-bold text-content">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-content-secondary">
                                        {item.body}
                                    </p>
                                </div>
                            </FadeUp>
                        );
                    })}
                </ul>
            ) : null}
        </Container>
    </PageSection>
);

export default HomeQualitySection;
