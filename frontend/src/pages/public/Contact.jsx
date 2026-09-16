import { useMemo } from "react";

import ContactLocationSection from "../../components/public/contact/ContactLocationSection";
import ContactMainSection from "../../components/public/contact/ContactMainSection";
import ContactSocialStrip from "../../components/public/contact/ContactSocialStrip";
import { resolveLocationData } from "../../components/public/contact/contactUtils";
import InnerPageHero from "../../components/public/InnerPageHero";
import { PublicPage } from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations, { ORDER_CONTACTS } from "../../i18n/publicTranslations";

const Contact = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.contact;
    const { error, getFirstSectionItem } = usePublicPageContent("contact");

    const hero = getFirstSectionItem("hero");
    const locationCms = getFirstSectionItem("location");

    const location = useMemo(
        () =>
            resolveLocationData({
                cmsItem: locationCms,
                contacts: ORDER_CONTACTS,
                brandName: translate(publicTranslations.brand.name),
                city: translate(t.city),
            }),
        [locationCms, t.city, translate]
    );

    const whatsappHref = `https://wa.me/${ORDER_CONTACTS.whatsapp}`;

    return (
        <PublicPage>
            <InnerPageHero
                eyebrow={translate(t.heroLabel)}
                title={hero?.title || translate(t.heroTitle)}
                description={hero?.content || translate(t.heroBody)}
            />

            <ContactMainSection
                label={translate(t.mainLabel)}
                title={translate(t.mainTitle)}
                description={translate(t.mainBody)}
                infoNote={translate(t.infoNote)}
                phoneLabel={translate(t.phoneLabel)}
                emailLabel={translate(t.emailLabel)}
                whatsappLabel={translate(t.whatsappLabel)}
                whatsappAction={translate(t.whatsappAction)}
                phone={ORDER_CONTACTS.phoneDisplay}
                phoneHref={ORDER_CONTACTS.phoneHref}
                email={ORDER_CONTACTS.email}
                whatsappHref={whatsappHref}
                formNameLabel={translate(t.formName)}
                formEmailLabel={translate(t.formEmail)}
                formSubjectLabel={translate(t.formSubject)}
                formMessageLabel={translate(t.formMessage)}
                formHeaderLabel={translate(t.formHeaderLabel)}
                formHeaderTitle={translate(t.formHeaderTitle)}
                formHeaderBody={translate(t.formHeaderBody)}
                formSubmitLabel={translate(t.formSubmit)}
                formSendingLabel={translate(t.formSending)}
                formSentLabel={translate(t.formSent)}
                formErrorEmail={translate(t.formErrorEmail)}
                formErrorMessage={translate(t.formErrorMessage)}
                formErrorInvalidEmail={translate(t.formErrorInvalidEmail)}
                formSubjectDefault={translate(t.formSubjectDefault)}
            />

            <ContactLocationSection
                label={translate(t.locationLabel)}
                title={translate(t.locationTitle)}
                description={translate(t.locationBody)}
                location={location}
                brandName={translate(publicTranslations.brand.name)}
                city={translate(t.city)}
                directionsLabel={translate(t.directionsLabel)}
                mapTitle={translate(t.mapTitle)}
                mapComingSoon={translate(t.mapComingSoon)}
            />

            <ContactSocialStrip
                label={translate(t.socialLabel)}
                email={ORDER_CONTACTS.email}
                emailHref={`mailto:${ORDER_CONTACTS.email}`}
                whatsappHref={whatsappHref}
                whatsappLabel={translate(t.whatsappLabel)}
                emailLabel={translate(t.emailLabel)}
                facebookLabel={translate(t.facebookLabel)}
                instagramLabel={translate(t.instagramLabel)}
            />

            {error ? (
                <p className="sr-only" role="status" aria-live="polite">
                    {error}
                </p>
            ) : null}
        </PublicPage>
    );
};

export default Contact;
