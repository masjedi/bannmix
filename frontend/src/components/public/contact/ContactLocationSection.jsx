import { ArrowRight, MapPin } from "lucide-react";

import { Container, FadeUp, PageSection } from "../ui";
import {
    buildDirectionsUrl,
    buildMapEmbedUrl,
    hasText,
} from "./contactUtils";

const MapPlaceholder = ({ name, city, comingSoonLabel }) => (
    <div className="contact-location-map-placeholder">
        <span className="contact-location-map-pin" aria-hidden="true">
            <MapPin size={24} strokeWidth={1.5} />
        </span>
        {hasText(name) ? (
            <p className="contact-location-map-brand">{name}</p>
        ) : null}
        {hasText(city) ? (
            <p className="contact-location-map-city">{city}</p>
        ) : null}
        {hasText(comingSoonLabel) ? (
            <p className="contact-location-map-soon">{comingSoonLabel}</p>
        ) : null}
    </div>
);

const ContactLocationSection = ({
    label,
    title,
    description,
    location,
    brandName,
    city,
    directionsLabel,
    mapTitle,
    mapComingSoon,
}) => {
    const directionsUrl = buildDirectionsUrl(location);
    const mapEmbedUrl = buildMapEmbedUrl(location);
    const hasMap = hasText(mapEmbedUrl);

    if (
        !hasText(title) &&
        !hasText(description) &&
        !hasMap &&
        !hasText(brandName)
    ) {
        return null;
    }

    return (
        <PageSection pad={false} className="contact-location">
            <Container className="contact-location-container">
                <FadeUp>
                    <div className="contact-location-header">
                        {hasText(label) ? (
                            <p className="contact-location-label">{label}</p>
                        ) : null}
                        {hasText(title) ? (
                            <h2
                                className={[
                                    "contact-location-title",
                                    hasText(label) ? "mt-3" : "",
                                ].join(" ")}
                            >
                                {title}
                            </h2>
                        ) : null}
                        {hasText(description) ? (
                            <p className="contact-location-desc mt-4">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </FadeUp>

                <FadeUp delay={60} className="contact-location-map-block">
                    <div className="contact-location-map-shell">
                        {hasMap ? (
                            <iframe
                                title={mapTitle}
                                src={mapEmbedUrl}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="contact-location-map-frame"
                                allowFullScreen
                            />
                        ) : (
                            <MapPlaceholder
                                name={brandName}
                                city={city}
                                comingSoonLabel={mapComingSoon}
                            />
                        )}
                    </div>

                    {hasText(directionsUrl) ? (
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="contact-location-directions"
                        >
                            {directionsLabel}
                            <ArrowRight
                                size={15}
                                aria-hidden="true"
                                className="contact-location-directions-arrow rtl:rotate-180"
                            />
                        </a>
                    ) : null}
                </FadeUp>
            </Container>
        </PageSection>
    );
};

export default ContactLocationSection;
