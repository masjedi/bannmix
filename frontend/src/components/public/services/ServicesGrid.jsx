import { Container, FadeUp, PageSection, SectionHeading } from "../ui";
import { hasText, resolveServiceIcon } from "./servicesUtils";

const ServiceItem = ({ icon: Icon, title, content }) => (
    <article className="services-item">
        <span className="services-item-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
        </span>

        {hasText(title) ? (
            <h3 className="services-item-title">{title}</h3>
        ) : null}

        {hasText(content) ? (
            <p className="services-item-body">{content}</p>
        ) : null}
    </article>
);

const ServicesGrid = ({ label, title, description, items = [] }) => {
    const services = (Array.isArray(items) ? items : []).filter(
        (item) => hasText(item?.title) || hasText(item?.content)
    );

    if (services.length === 0) return null;

    return (
        <PageSection pad={false} className="services-offer">
            <Container>
                <FadeUp>
                    <SectionHeading
                        label={label}
                        title={title}
                        description={description}
                        className="services-offer-header"
                    />
                </FadeUp>

                <ul className="services-grid mt-10">
                    {services.map((item, index) => {
                        const Icon = resolveServiceIcon(item.icon, index);

                        return (
                            <FadeUp
                                as="li"
                                key={item.id ?? `${item.title}-${index}`}
                                delay={index * 50}
                                className="services-grid-item"
                            >
                                <ServiceItem
                                    icon={Icon}
                                    title={item.title}
                                    content={item.content}
                                />
                            </FadeUp>
                        );
                    })}
                </ul>
            </Container>
        </PageSection>
    );
};

export default ServicesGrid;
