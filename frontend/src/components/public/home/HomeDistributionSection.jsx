import { Container, FadeUp, PageSection, SectionHeading } from "../ui";
import { resolveHomeIcon } from "./homeUtils";

const formatStep = (index) => String(index + 1).padStart(2, "0");

const HomeDistributionSection = ({
    label,
    title,
    description,
    points = [],
}) => (
    <PageSection
        id="distribution"
        border={false}
        className="home-distribution home-section-compact home-section-soft"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                    description={description}
                />
            </FadeUp>

            {points.length > 0 ? (
                <FadeUp delay={80}>
                    <ol className="home-distribution-track mt-8 sm:mt-9">
                        {points.map((item, index) => {
                            const Icon = resolveHomeIcon(item.icon);
                            const isLast = index === points.length - 1;

                            return (
                                <li
                                    key={item.title}
                                    className="home-distribution-step"
                                >
                                    <div className="home-distribution-marker">
                                        <span className="home-info-icon home-distribution-icon">
                                            <Icon
                                                size={16}
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        {isLast ? null : (
                                            <span
                                                className="home-distribution-line"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <div className="home-distribution-copy">
                                        <p
                                            className="home-distribution-number"
                                            aria-hidden="true"
                                        >
                                            {formatStep(index)}
                                        </p>
                                        <h3 className="home-distribution-title">
                                            {item.title}
                                        </h3>
                                        <p className="home-distribution-body">
                                            {item.body}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </FadeUp>
            ) : null}
        </Container>
    </PageSection>
);

export default HomeDistributionSection;
