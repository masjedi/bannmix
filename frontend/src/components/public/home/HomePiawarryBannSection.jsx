import {
    Container,
    FadeUp,
    PageSection,
    SectionHeading,
} from "../ui";
import { resolveHomeIcon } from "./homeUtils";

const HomePiawarryBannSection = ({
    label,
    title,
    attributes = [],
}) => (
    <PageSection
        id="our-piawarrybann"
        border={false}
        className="home-piawarrybann home-section-compact"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                />
            </FadeUp>

            <ul className="home-piawarrybann-grid mt-8 sm:mt-10">
                {attributes.map((item, index) => {
                    const Icon = resolveHomeIcon(item.icon);

                    return (
                        <FadeUp
                            key={item.title}
                            as="li"
                            delay={index * 60}
                            className="home-piawarrybann-item"
                        >
                            <span className="home-info-icon">
                                <Icon
                                    size={18}
                                    strokeWidth={1.75}
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="home-piawarrybann-item-title">
                                {item.title}
                            </h3>
                            <p className="home-piawarrybann-item-body">{item.body}</p>
                        </FadeUp>
                    );
                })}
            </ul>
        </Container>
    </PageSection>
);

export default HomePiawarryBannSection;
