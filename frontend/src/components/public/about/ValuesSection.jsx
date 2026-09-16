import {
    Eye,
    Handshake,
    HeartHandshake,
    Leaf,
    ShieldCheck,
    Sparkles,
    Target,
} from "lucide-react";

import {
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    SectionHeading,
} from "../ui";
import { hasText, valuesGridClass } from "./aboutUtils";

const ICON_MAP = {
    leaf: Leaf,
    quality: ShieldCheck,
    honesty: HeartHandshake,
    partnership: Handshake,
    handshake: Handshake,
    heart: HeartHandshake,
    target: Target,
    eye: Eye,
    sparkles: Sparkles,
    shield: ShieldCheck,
};

const DEFAULT_ICONS = [Leaf, HeartHandshake, Target, Eye, Handshake, ShieldCheck];

const resolveIcon = (iconKey, index) => {
    if (typeof iconKey === "string") {
        const mapped = ICON_MAP[iconKey.toLowerCase().trim()];
        if (mapped) return mapped;
    }
    return DEFAULT_ICONS[index % DEFAULT_ICONS.length];
};

const ValuesSection = ({ label, title, description, values = [] }) => {
    const items = (Array.isArray(values) ? values : []).filter(
        (item) => hasText(item?.title) || hasText(item?.description)
    );

    if (items.length === 0) return null;

    return (
        <PageSection>
            <Container>
                <FadeUp>
                    <SectionHeading
                        label={label}
                        title={title}
                        description={description}
                    />
                </FadeUp>

                <div className={`mt-10 grid gap-5 ${valuesGridClass(items.length)}`}>
                    {items.map((item, index) => {
                        const Icon = resolveIcon(item.icon, index);
                        return (
                            <FadeUp key={item.id ?? `${item.title}-${index}`} delay={index * 50}>
                                <PublicCard
                                    hover
                                    className="flex h-full flex-col"
                                >
                                    <span className="grid h-11 w-11 place-items-center rounded-btn bg-brand-orange/10 text-brand-orange">
                                        <Icon size={19} strokeWidth={1.75} />
                                    </span>
                                    {hasText(item.title) ? (
                                        <h3 className="mt-5 break-words text-lg font-bold text-content text-content">
                                            {item.title}
                                        </h3>
                                    ) : null}
                                    {hasText(item.description) ? (
                                        <p className="mt-2 break-words text-sm leading-6 text-content-secondary text-content-secondary">
                                            {item.description}
                                        </p>
                                    ) : null}
                                </PublicCard>
                            </FadeUp>
                        );
                    })}
                </div>
            </Container>
        </PageSection>
    );
};

export default ValuesSection;
