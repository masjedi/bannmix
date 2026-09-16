import { useMemo } from "react";



import heroImage from "../../assets/hero.png";

import InnerPageHero from "../../components/public/InnerPageHero";

import LeadershipSection from "../../components/public/about/LeadershipSection";

import StoryMissionVision from "../../components/public/about/StoryMissionVision";

import ValuesSection from "../../components/public/about/ValuesSection";

import {

    hasText,

    mapGalleryItem,

    mapTeamMember,

    mapValueItem,

    pickDescription,

    pickFirst,

    pickImage,

    resolveFirstItem,

    resolveSection,

} from "../../components/public/about/aboutUtils";

import ProductsCtaSection from "../../components/public/ProductsCtaSection";

import { PublicPage } from "../../components/public/ui";

import { useLanguage } from "../../context/LanguageContext";

import usePublicPageContent from "../../hooks/usePublicPageContent";

import publicTranslations, {

    ABOUT_GALLERY,

    ABOUT_TEAM,

    ABOUT_VALUES,

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



    const pageContent = useMemo(() => {

        const heroItem = resolveFirstItem(getSection, getFirstSectionItem, [

            "hero",

            "introduction",

            "about_hero",

        ]);

        const heroMeta =

            heroItem?.metadata && typeof heroItem.metadata === "object"

                ? heroItem.metadata

                : {};



        const storyCms = buildBlock(

            resolveFirstItem(getSection, getFirstSectionItem, [

                "story",

                "company_history",

                "history",

                "our_story",

            ])

        );

        const missionCms = buildBlock(

            resolveFirstItem(getSection, getFirstSectionItem, [

                "mission",

                "company_mission",

            ])

        );

        const visionCms = buildBlock(

            resolveFirstItem(getSection, getFirstSectionItem, [

                "vision",

                "company_vision",

            ])

        );



        const hasCmsStoryBlock = Boolean(storyCms || missionCms || visionCms);



        const cmsValues = resolveSection(getSection, [

            "values",

            "our_values",

            "company_values",

        ]);

        const cmsTeam = resolveSection(getSection, [

            "team",

            "leadership",

            "our_leadership",

        ]);

        const cmsGallery = resolveSection(getSection, [

            "gallery",

            "factory_gallery",

            "production_gallery",

            "production",

        ]);



        const values =

            cmsValues.length > 0

                ? cmsValues.map(mapValueItem).filter(

                      (item) =>

                          hasText(item.title) || hasText(item.description)

                  )

                : ABOUT_VALUES.map((item, index) => ({

                      id: `fallback-value-${index}`,

                      title: translate(item.title),

                      description: translate(item.body),

                      icon: undefined,

                  }));



        const team =

            cmsTeam.length > 0

                ? cmsTeam

                      .map(mapTeamMember)

                      .filter((member) => hasText(member.name))

                : ABOUT_TEAM.map((member, index) => ({

                      id: `fallback-team-${index}`,

                      name: translate(member.name),

                      position: translate(member.position),

                      description: translate(member.description),

                      image: "",

                      linkedin_url: "",

                      facebook_url: "",

                      email: "",

                  }));



        const mappedGallery = cmsGallery

            .map(mapGalleryItem)

            .filter((item) => hasText(item.image));



        const gallery =

            mappedGallery.length > 0

                ? mappedGallery

                : [

                      {

                          id: "fallback-gallery-0",

                          image: heroImage,

                          title: translate(ABOUT_GALLERY[0]?.title),

                          description: "",

                      },

                  ];



        return {

            hero: {

                label: pickFirst(

                    heroItem?.subtitle,

                    heroMeta.label,

                    translate(t.heroLabel)

                ),

                title: pickFirst(heroItem?.title, translate(t.heroTitle)),

                description: pickFirst(

                    pickDescription(heroItem),

                    translate(t.heroBody)

                ),

                image: pickFirst(

                    pickImage(heroItem),

                    heroItem ? "" : heroImage

                ),

                primaryCtaText: pickFirst(

                    heroItem?.button_text,

                    heroMeta.primary_cta_text,

                    translate(t.primaryCta)

                ),

                primaryCtaUrl: pickFirst(

                    heroItem?.button_url,

                    heroMeta.primary_cta_url,

                    "/products"

                ),

                secondaryCtaText: pickFirst(

                    heroMeta.secondary_cta_text,

                    heroMeta.secondary_button_text,

                    translate(t.secondaryCta)

                ),

                secondaryCtaUrl: pickFirst(

                    heroMeta.secondary_cta_url,

                    heroMeta.secondary_button_url,

                    ORDER_CONTACTS.phoneHref

                ),

            },

            story: hasCmsStoryBlock

                ? storyCms

                : {

                      title: translate(t.historyTitle),

                      description: translate(t.historyBody),

                      image: "",

                  },

            mission: hasCmsStoryBlock

                ? missionCms

                : {

                      title: translate(t.missionTitle),

                      description: translate(t.missionBody),

                  },

            vision: hasCmsStoryBlock

                ? visionCms

                : {

                      title: translate(t.visionTitle),

                      description: translate(t.visionBody),

                  },

            values,

            team,

            gallery,

        };

    }, [getFirstSectionItem, getSection, t, translate]);



    return (

        <PublicPage>

            <InnerPageHero
                eyebrow={pageContent.hero.label}
                title={pageContent.hero.title}
                description={pageContent.hero.description}
                primaryAction={{
                    label: pageContent.hero.primaryCtaText,
                    href: pageContent.hero.primaryCtaUrl,
                }}
                secondaryAction={{
                    label: pageContent.hero.secondaryCtaText,
                    href: pageContent.hero.secondaryCtaUrl,
                }}
            />



            <StoryMissionVision

                story={pageContent.story}

                mission={pageContent.mission}

                vision={pageContent.vision}

                storyLabel={translate(t.storyLabel)}

                missionLabel={translate(t.missionLabel)}

                visionLabel={translate(t.visionLabel)}

            />



            <ValuesSection

                label={translate(t.valuesLabel)}

                title={translate(t.valuesTitle)}

                description={translate(t.valuesBody)}

                values={pageContent.values}

            />



            <LeadershipSection

                label={translate(t.leadershipLabel)}

                title={translate(t.leadershipTitle)}

                description={translate(t.leadershipBody)}

                team={pageContent.team}

                primaryCtaText={translate(t.primaryCta)}

                primaryCtaUrl="/products"

                secondaryCtaText={translate(t.secondaryCta)}

                secondaryCtaUrl={ORDER_CONTACTS.phoneHref}

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

