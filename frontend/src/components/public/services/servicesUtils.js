import { Handshake, Leaf, PackageSearch, ShieldCheck } from "lucide-react";

export { hasText } from "../about/aboutUtils";

export const SERVICE_ICON_LIST = [
    PackageSearch,
    ShieldCheck,
    Handshake,
    Leaf,
];

export const SERVICE_ICON_MAP = {
    sourcing: PackageSearch,
    quality: ShieldCheck,
    partnership: Handshake,
    partnerships: Handshake,
    natural: Leaf,
    leaf: Leaf,
};

export const resolveServiceIcon = (iconKey, index) => {
    if (typeof iconKey === "string") {
        const mapped = SERVICE_ICON_MAP[iconKey.toLowerCase().trim()];
        if (mapped) return mapped;
    }
    return SERVICE_ICON_LIST[index % SERVICE_ICON_LIST.length];
};
