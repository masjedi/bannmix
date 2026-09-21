import { useMemo } from "react";

import InnerPageHero from "../../components/public/InnerPageHero";
import LeadershipSection from "../../components/public/about/LeadershipSection";
import StoryMissionVision from "../../components/public/about/StoryMissionVision";
import ValuesSection from "../../components/public/about/ValuesSection";
import {
    hasText,
    mapTeamMember,
    mapValueItem,
    pickDescription,
    pickFirst,
    pickImage,
} from "../../components/public/about/aboutUtils";
import ProductsCtaSection from "../../components/public/ProductsCtaSection";
import { PublicPage } from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations, {
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const buildBlock = (item) => {
    if (!item) return null;

    const block = {
        title: pickFirst(item.title),
        description: pickDescription(item),
        image: pickImage(item),
    };

    if (
        !hasText(block.title) &&
        !hasText(block.description) &&
        !hasText(block.image)
    ) {
        return null;
    }

    return block;
};

const About = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.about;
    const productsCta = publicTranslations.services;
    const { error, getSection, getFirstSectionItem } =
        usePublicPageContent("about");

    const heroItem = getFirstSectionItem("hero");
    const story = buildBlock(getFirstSectionItem("story"));
    const mission = buildBlock(getFirstSectionItem("mission"));
    const vision = buildBlock(getFirstSectionItem("vision"));
    const valueItems = getSection("values");
    const teamItems = getSection("team");

    const hero = useMemo(() => {
        if (!heroItem) return null;

        return {
            label: pickFirst(heroItem.subtitle),
            title: pickFirst(heroItem.title),
            description: pickDescription(heroItem),
            primaryCtaText: pickFirst(heroItem.button_text),
            primaryCtaUrl: pickFirst(heroItem.button_url),
        };
    }, [heroItem]);

    const values = useMemo(
        () =>
            valueItems
                .map(mapValueItem)
                .filter(
                    (item) => hasText(item.title) || hasText(item.description)
                ),
        [valueItems]
    );

    const team = useMemo(
        () =>
            teamItems
                .map(mapTeamMember)
                .filter((member) => hasText(member.name)),
        [teamItems]
    );

    return (
        <PublicPage>
            {hero ? (
                <InnerPageHero
                    eyebrow={hero.label}
                    title={hero.title}
                    description={hero.description}
                    primaryAction={{
                        label: hero.primaryCtaText,
                        href: hero.primaryCtaUrl,
                    }}
                />
            ) : null}

            <StoryMissionVision
                story={story}
                mission={mission}
                vision={vision}
                storyLabel={translate(t.storyLabel)}
                missionLabel={translate(t.missionLabel)}
                visionLabel={translate(t.visionLabel)}
            />

            <ValuesSection
                label={translate(t.valuesLabel)}
                title={translate(t.valuesTitle)}
                description={translate(t.valuesBody)}
                values={values}
            />

            <LeadershipSection
                label={translate(t.leadershipLabel)}
                title={translate(t.leadershipTitle)}
                description={translate(t.leadershipBody)}
                team={team}
            />

            <ProductsCtaSection
                label={translate(productsCta.ctaLabel)}
                title={translate(productsCta.ctaTitle)}
                description={translate(productsCta.ctaBody)}
                primaryCtaText={translate(productsCta.viewProducts)}
                primaryCtaUrl="/products"
                secondaryCtaText={translate(productsCta.contactUs)}
                secondaryCtaUrl={ORDER_CONTACTS.phoneHref}
            />

            {error ? (
                <p className="sr-only" role="status" aria-live="polite">
                    {error}
                </p>
            ) : null}
        </PublicPage>
    );
};

export default About;
