import {
    Check,
    Factory,
    Leaf,
    MapPin,
    Package,
    ShoppingBag,
    Store,
    Truck,
    Users,
} from "lucide-react";

export const HOME_ICON_MAP = {
    leaf: Leaf,
    check: Check,
    package: Package,
    factory: Factory,
    store: Store,
    bag: ShoppingBag,
    truck: Truck,
    users: Users,
    map: MapPin,
};

export const resolveHomeIcon = (key, fallback = Package) => {
    if (typeof key !== "string") return fallback;
    return HOME_ICON_MAP[key] || fallback;
};

export const collectProductImages = (products = []) => {
    const images = [];

    products.forEach((product) => {
        if (product?.main_image_url) {
            images.push(product.main_image_url);
        }

        (product?.gallery_image_urls || []).forEach((url) => {
            if (url) images.push(url);
        });
    });

    return [...new Set(images.filter(Boolean))];
};

export const buildHomeHeroSlides = ({
    productImages = [],
    translate,
    copy,
}) => {
    const uniqueImages = [...new Set(productImages.filter(Boolean))];
    const pickImage = (index) => uniqueImages[index] || "";

    const themes = [
        {
            id: "product",
            image: pickImage(0),
            caption: translate(copy.heroSlideProductCaption),
            alt: translate(copy.heroSlideProductAlt),
            fallbackLabel: translate(copy.heroSlideProductFallback),
            tone: "product",
        },
        {
            id: "retail",
            image: pickImage(1),
            caption: translate(copy.heroSlideRetailCaption),
            alt: translate(copy.heroSlideRetailAlt),
            fallbackLabel: translate(copy.heroSlideRetailFallback),
            tone: "retail",
        },
        {
            id: "wholesale",
            image: pickImage(2),
            caption: translate(copy.heroSlideWholesaleCaption),
            alt: translate(copy.heroSlideWholesaleAlt),
            fallbackLabel: translate(copy.heroSlideWholesaleFallback),
            tone: "wholesale",
        },
    ];

    return themes;
};
