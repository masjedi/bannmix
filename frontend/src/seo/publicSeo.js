export const SITE_ORIGIN = "https://bannmix.af";

export const PUBLIC_SEO = {
    "/": {
        title: "BannMix | Natural Food Production in Afghanistan",
        description:
            "BannMix is a natural food production company in Afghanistan, making quality nutritional foods and supplying shops, supermarkets, and wholesale partners.",
    },
    "/about": {
        title: "About BannMix | Natural Food Production in Afghanistan",
        description:
            "Learn about BannMix, our food production in Afghanistan, our commitment to quality ingredients, and the people behind our products.",
    },
    "/products": {
        title: "Natural Food Products | BannMix Afghanistan",
        description:
            "Explore BannMix natural and nutritional food products made in Afghanistan for customers, shops, and wholesale partners.",
    },
    "/services": {
        title: "Services and Wholesale Supply | BannMix Afghanistan",
        description:
            "Discover how BannMix supports shops, supermarkets, and wholesale partners with food production, quality, and distribution in Afghanistan.",
    },
    "/events": {
        title: "Events and News | BannMix Afghanistan",
        description:
            "See the latest BannMix events, exhibitions, and community activities from our natural food production company in Afghanistan.",
    },
    "/gallery": {
        title: "Gallery | BannMix Afghanistan",
        description:
            "View photos of BannMix products, production, events, and the people behind our natural foods in Afghanistan.",
    },
    "/contact": {
        title: "Contact BannMix | Food Production in Afghanistan",
        description:
            "Contact BannMix in Afghanistan for product information, wholesale supply, partnerships, and customer enquiries.",
    },
};

export const getPublicSeo = (pathname) => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const detail = path.startsWith("/products/")
        ? {
              title: "Product Details | BannMix Afghanistan",
              description:
                  "Explore a BannMix natural food product made in Afghanistan, including product details and ordering information.",
          }
        : path.startsWith("/events/")
          ? {
                title: "Event Details | BannMix Afghanistan",
                description:
                    "Learn about a BannMix event or community activity in Afghanistan.",
            }
          : null;
    const page = detail || PUBLIC_SEO[path];

    return page
        ? { ...page, canonical: `${SITE_ORIGIN}${path === "/" ? "/" : path}` }
        : null;
};
