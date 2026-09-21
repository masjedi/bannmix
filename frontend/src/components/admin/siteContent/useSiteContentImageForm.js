import { useCallback, useState } from "react";

import { getVisibleExistingImages, releaseNewImagePreviews } from "./siteContentFormUtils";

const useSiteContentImageForm = ({ form, setForm }) => {
    const [singlePreview, setSinglePreview] = useState("");

    const releaseSinglePreview = useCallback(() => {
        if (singlePreview) {
            URL.revokeObjectURL(singlePreview);
            setSinglePreview("");
        }
    }, [singlePreview]);

    const releaseAllImagePreviews = useCallback(
        (targetForm = form) => {
            if (singlePreview) {
                URL.revokeObjectURL(singlePreview);
                setSinglePreview("");
            }
            releaseNewImagePreviews(targetForm?.new_images ?? []);
        },
        [form, singlePreview]
    );

    const handleImageChange = useCallback(
        (event) => {
            const file = event.target.files?.[0] ?? null;

            if (singlePreview) {
                URL.revokeObjectURL(singlePreview);
                setSinglePreview("");
            }

            if (!file) {
                setForm((current) => ({ ...current, image: null }));
                return;
            }

            setSinglePreview(URL.createObjectURL(file));
            setForm((current) => ({
                ...current,
                image: file,
                remove_image: false,
            }));
        },
        [setForm, singlePreview]
    );

    const removeSelectedImage = useCallback(() => {
        if (singlePreview) {
            URL.revokeObjectURL(singlePreview);
            setSinglePreview("");
        }

        setForm((current) => ({
            ...current,
            image: null,
            remove_image: true,
        }));
    }, [setForm, singlePreview]);

    const restoreExistingImage = useCallback(() => {
        if (singlePreview) {
            URL.revokeObjectURL(singlePreview);
            setSinglePreview("");
        }

        setForm((current) => ({
            ...current,
            image: null,
            remove_image: false,
        }));
    }, [setForm, singlePreview]);

    const handleAddImages = useCallback(
        (event) => {
            const files = Array.from(event.target.files ?? []);

            if (files.length === 0) {
                return;
            }

            setForm((current) => ({
                ...current,
                new_images: [
                    ...(current.new_images ?? []),
                    ...files.map((file) => ({
                        id: `${file.name}-${file.lastModified}-${Math.random()}`,
                        file,
                        preview: URL.createObjectURL(file),
                    })),
                ],
            }));

            event.target.value = "";
        },
        [setForm]
    );

    const handleRemoveExistingImage = useCallback(
        (path) => {
            setForm((current) => ({
                ...current,
                removed_image_paths: [...(current.removed_image_paths ?? []), path],
            }));
        },
        [setForm]
    );

    const handleRemoveNewImage = useCallback(
        (id) => {
            setForm((current) => {
                const target = (current.new_images ?? []).find((entry) => entry.id === id);

                if (target?.preview) {
                    URL.revokeObjectURL(target.preview);
                }

                return {
                    ...current,
                    new_images: (current.new_images ?? []).filter((entry) => entry.id !== id),
                };
            });
        },
        [setForm]
    );

    const imagePreview = form.image
        ? singlePreview
        : form.remove_image
          ? ""
          : form.image_url;

    const visibleExistingImages = getVisibleExistingImages(form);

    return {
        handleImageChange,
        removeSelectedImage,
        restoreExistingImage,
        handleAddImages,
        handleRemoveExistingImage,
        handleRemoveNewImage,
        releaseAllImagePreviews,
        imagePreview,
        visibleExistingImages,
    };
};

export default useSiteContentImageForm;
