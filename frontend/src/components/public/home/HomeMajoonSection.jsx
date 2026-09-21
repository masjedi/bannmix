import {
    Container,
    FadeUp,
    PageSection,
    SectionHeading,
} from "../ui";
import { resolveHomeIcon } from "./homeUtils";

const HomeMajoonSection = ({
    label,
    title,
    attributes = [],
}) => (
    <PageSection
        id="our-majoon"
        border={false}
        className="home-majoon home-section-compact"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                />
            </FadeUp>

            <ul className="home-majoon-grid mt-8 sm:mt-10">
                {attributes.map((item, index) => {
                    const Icon = resolveHomeIcon(item.icon);

                    return (
                        <FadeUp
                            key={item.title}
                            as="li"
                            delay={index * 60}
                            className="home-majoon-item"
                        >
                            <span className="home-info-icon">
                                <Icon
                                    size={18}
                                    strokeWidth={1.75}
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="home-majoon-item-title">
                                {item.title}
                            </h3>
                            <p className="home-majoon-item-body">{item.body}</p>
                        </FadeUp>
                    );
                })}
            </ul>
        </Container>
    </PageSection>
);

export default HomeMajoonSection;
