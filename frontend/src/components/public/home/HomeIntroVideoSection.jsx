import { useState } from "react";



import { Play } from "lucide-react";



import { Container, FadeUp, PageSection, SectionHeading } from "../ui";

import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube";



const HomeIntroVideoSection = ({

    label,

    title,

    description,

    youtubeUrl,

    thumbnailUrl = "",

    thumbnailAlt = "",

    playLabel,

    caption,

}) => {

    const videoId = extractYouTubeId(youtubeUrl);

    const [playing, setPlaying] = useState(false);



    if (!videoId) {

        return null;

    }



    const poster = thumbnailUrl?.trim() || youtubeThumbnailUrl(videoId);



    return (

        <PageSection

            id="home-intro-video"

            border={false}

            className="home-intro-video home-section-compact"

        >

            <Container>

                {label || title || description ? (

                    <SectionHeading

                        label={label}

                        title={title}

                        description={description}

                        align="center"

                        className="mx-auto mb-8 sm:mb-10"

                    />

                ) : null}



                <FadeUp>

                    <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl bg-theme-surface-soft">

                        {playing ? (

                            <iframe

                                className="absolute inset-0 h-full w-full"

                                src={youtubeEmbedUrl(videoId)}

                                title="BanMix introduction video"

                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

                                allowFullScreen

                            />

                        ) : (

                            <>

                                <img

                                    src={poster}

                                    alt={thumbnailUrl?.trim() ? thumbnailAlt : ""}

                                    loading="lazy"

                                    decoding="async"

                                    className="absolute inset-0 h-full w-full object-cover"

                                />

                                <div

                                    className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-brand-navy/10 to-transparent"

                                    aria-hidden="true"

                                />

                                <button

                                    type="button"

                                    onClick={() => setPlaying(true)}

                                    className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-orange text-white shadow-sm transition hover:bg-brand-orange/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange sm:h-16 sm:w-16"

                                    aria-label={playLabel}

                                >

                                    <Play

                                        size={26}

                                        className="ms-0.5 fill-white"

                                        aria-hidden="true"

                                    />

                                </button>

                                {caption?.trim() ? (

                                    <p className="type-body-sm absolute bottom-4 start-4 font-semibold text-white">

                                        {caption}

                                    </p>

                                ) : null}

                            </>

                        )}

                    </div>

                </FadeUp>

            </Container>

        </PageSection>

    );

};



export default HomeIntroVideoSection;

