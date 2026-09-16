import { hasText, pickFirst } from "../about/aboutUtils";

export { hasText };

export const resolveLocationData = ({
    cmsItem,
    contacts,
    brandName,
    city,
}) => {
    const meta =
        cmsItem?.metadata && typeof cmsItem.metadata === "object"
            ? cmsItem.metadata
            : {};
    const location = contacts?.location ?? {};

    const latitude = parseCoordinate(
        pickFirst(meta.latitude, meta.lat, location.latitude)
    );
    const longitude = parseCoordinate(
        pickFirst(meta.longitude, meta.lng, location.longitude)
    );

    return {
        name: pickFirst(cmsItem?.title, brandName),
        city: pickFirst(cmsItem?.subtitle, city),
        address: pickFirst(
            meta.address,
            meta.full_address,
            location.address,
            cmsItem?.content
        ),
        phone: contacts.phoneDisplay,
        phoneHref: contacts.phoneHref,
        email: contacts.email,
        workingHours: pickFirst(
            meta.working_hours,
            meta.workingHours,
            location.workingHours
        ),
        latitude,
        longitude,
        mapEmbedUrl: pickFirst(
            meta.map_embed_url,
            meta.mapEmbedUrl,
            location.mapEmbedUrl
        ),
        directionsUrl: pickFirst(
            meta.directions_url,
            meta.directionsUrl,
            location.directionsUrl
        ),
    };
};

const parseCoordinate = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

export const buildDirectionsUrl = (location) => {
    if (hasText(location.directionsUrl)) return location.directionsUrl.trim();

    if (location.latitude != null && location.longitude != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    }

    const query = [location.name, location.address, location.city]
        .filter(hasText)
        .join(", ");

    if (!hasText(query)) return "";

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const buildMapEmbedUrl = (location) => {
    if (hasText(location.mapEmbedUrl)) return location.mapEmbedUrl.trim();

    if (location.latitude == null || location.longitude == null) return "";

    const { latitude, longitude } = location;
    const delta = 0.012;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;
};

export const buildContactMailto = ({ name, email, subject, message, to }) => {
    const body = [
        hasText(name) ? `Name: ${name}` : "",
        hasText(email) ? `Email: ${email}` : "",
        "",
        message,
    ]
        .filter((line, index, arr) => line !== "" || index === arr.length - 2)
        .join("\n");

    const params = new URLSearchParams();
    if (hasText(subject)) params.set("subject", subject);
    if (hasText(body)) params.set("body", body);
    if (hasText(email)) params.set("reply-to", email);

    const query = params.toString();
    return query ? `mailto:${to}?${query}` : `mailto:${to}`;
};
