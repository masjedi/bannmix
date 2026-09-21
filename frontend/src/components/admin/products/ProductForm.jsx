import { useEffect, useMemo, useState } from "react";



import { Image as ImageIcon, LoaderCircle, Trash2 } from "lucide-react";



import TextEditor from "../../TextEditor";

import { isEmptyHtml, sanitizeHtml } from "../../../utils/htmlText";



const inputClassName =

    "h-10 w-full rounded-lg border border-line bg-theme-surface px-3 text-content-secondary outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";



const textareaClassName =

    "min-h-24 w-full rounded-lg border border-line bg-theme-surface px-3 py-2 text-content-secondary outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";



const emptyForm = {

    title: "",

    content: "",

    category: "",

    price: "",

    currency: "AFN",

    moq: "1",

    unit: "",

    certifications: "",

    status: "published",

};



const formFromProduct = (product) => {

    if (!product) return { ...emptyForm };



    return {

        title: product.title || product.name || "",

        content: product.content || product.description || "",

        category:

            typeof product.category === "string"

                ? product.category

                : product.category?.name || "",

        price: product.price ?? "",

        currency: product.currency || "AFN",

        moq: product.moq ?? "1",

        unit: product.unit || "",

        certifications: product.certifications || "",

        status: product.status || "published",

    };

};



const ProductForm = ({

    product = null,

    saving = false,

    error = "",

    submitLabel = "Save product",

    onSubmit,

    onCancel,

}) => {

    const [form, setForm] = useState(() => formFromProduct(product));

    const [mainImage, setMainImage] = useState(null);

    const [galleryImages, setGalleryImages] = useState([]);

    const [formError, setFormError] = useState("");



    useEffect(() => {

        setForm(formFromProduct(product));

        setMainImage(null);

        setGalleryImages([]);

        setFormError("");

    }, [product]);



    const mainPreview = useMemo(() => {

        if (mainImage) return URL.createObjectURL(mainImage);

        return product?.main_image_url || product?.main_image || "";

    }, [mainImage, product]);



    useEffect(() => {

        if (!mainImage || !mainPreview) return undefined;

        return () => URL.revokeObjectURL(mainPreview);

    }, [mainImage, mainPreview]);



    const galleryPreviews = useMemo(

        () => galleryImages.map((file) => URL.createObjectURL(file)),

        [galleryImages]

    );



    useEffect(() => {

        return () => {

            galleryPreviews.forEach((url) => URL.revokeObjectURL(url));

        };

    }, [galleryPreviews]);



    const existingGallery = Array.isArray(product?.gallery_image_urls)

        ? product.gallery_image_urls.filter(Boolean)

        : [];



    const updateField = (event) => {

        const { name, value } = event.target;

        setForm((current) => ({ ...current, [name]: value }));

    };



    const handleSubmit = (event) => {

        event.preventDefault();



        if (!form.title.trim()) {

            setFormError("Product name is required.");

            return;

        }



        if (isEmptyHtml(form.content)) {

            setFormError("Description is required.");

            return;

        }



        if (!form.category.trim()) {

            setFormError("Category is required.");

            return;

        }



        if (form.price === "" || Number.isNaN(Number(form.price))) {

            setFormError("Enter a valid price.");

            return;

        }



        const payload = {

            title: form.title.trim(),

            content: sanitizeHtml(form.content),

            category: form.category.trim(),

            price: form.price,

            currency: form.currency,

            moq: form.moq === "" ? 1 : form.moq,

            unit: form.unit.trim(),

            certifications: form.certifications.trim(),

        };



        if (product) {

            payload.status = form.status;

        }



        if (mainImage) {

            payload.main_image = mainImage;

        }



        if (galleryImages.length > 0) {

            payload.gallery_images = galleryImages;

        }



        setFormError("");

        onSubmit?.(payload);

    };



    return (

        <form onSubmit={handleSubmit} className="space-y-5">

            {error || formError ? (

                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    {formError || error}

                </p>

            ) : null}



            <div className="grid gap-4 md:grid-cols-2">

                <label className="space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2">

                    <span>Product name *</span>

                    <input

                        name="title"

                        value={form.title}

                        onChange={updateField}

                        className={inputClassName}

                    />

                </label>



                <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                    <span>Category *</span>

                    <input

                        name="category"

                        value={form.category}

                        onChange={updateField}

                        placeholder="Majoon"

                        className={inputClassName}

                    />

                </label>



                <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                    <span>Unit</span>

                    <input

                        name="unit"

                        value={form.unit}

                        onChange={updateField}

                        placeholder="jar, box, kg"

                        className={inputClassName}

                    />

                </label>



                <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                    <span>Price *</span>

                    <input

                        name="price"

                        type="number"

                        min="0"

                        step="0.01"

                        value={form.price}

                        onChange={updateField}

                        className={inputClassName}

                    />

                </label>



                <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                    <span>Currency</span>

                    <select

                        name="currency"

                        value={form.currency}

                        onChange={updateField}

                        className={inputClassName}

                    >

                        <option value="AFN">AFN</option>

                        <option value="USD">USD</option>

                    </select>

                </label>



                <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                    <span>Minimum order (MOQ)</span>

                    <input

                        name="moq"

                        type="number"

                        min="0"

                        value={form.moq}

                        onChange={updateField}

                        className={inputClassName}

                    />

                </label>



                {product ? (

                    <label className="space-y-1.5 text-sm font-medium text-content-secondary">

                        <span>Status</span>

                        <select

                            name="status"

                            value={form.status}

                            onChange={updateField}

                            className={inputClassName}

                        >

                            <option value="published">Published</option>

                            <option value="pending">Draft</option>

                            <option value="rejected">Hidden</option>

                        </select>

                    </label>

                ) : null}



                <label className="space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2">

                    <span>Key features</span>

                    <textarea

                        name="certifications"

                        value={form.certifications}

                        onChange={updateField}

                        placeholder="One feature per line or comma-separated"

                        className={textareaClassName}

                    />

                    <span className="block text-xs font-normal text-content-muted">

                        Shown in the Key Features section on the public product

                        page.

                    </span>

                </label>

            </div>



            <div className="space-y-1.5 text-sm font-medium text-content-secondary">

                <span>Description *</span>

                <TextEditor

                    value={form.content}

                    onChange={(content) =>

                        setForm((current) => ({ ...current, content }))

                    }

                    placeholder="Write the product description…"

                    minHeight="12rem"

                    disabled={saving}

                />

            </div>



            <div className="grid gap-4 md:grid-cols-2">

                <div className="space-y-2">

                    <p className="text-sm font-medium text-content-secondary">

                        Cover image

                    </p>

                    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-theme-page px-4 text-center transition hover:border-brand-orange hover:bg-brand-orange/5">

                        <ImageIcon size={22} className="text-content-muted" />

                        <span className="mt-2 text-sm font-semibold text-content-secondary">

                            Choose cover image

                        </span>

                        <input

                            type="file"

                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"

                            className="sr-only"

                            onChange={(event) =>

                                setMainImage(event.target.files?.[0] || null)

                            }

                        />

                    </label>

                    {mainPreview ? (

                        <div className="relative overflow-hidden rounded-xl border border-line">

                            <img

                                src={mainPreview}

                                alt=""

                                className="h-28 w-full object-cover"

                            />

                            {mainImage ? (

                                <button

                                    type="button"

                                    onClick={() => setMainImage(null)}

                                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-theme-surface/90 text-red-600 shadow"

                                    aria-label="Remove cover image"

                                >

                                    <Trash2 size={15} />

                                </button>

                            ) : null}

                        </div>

                    ) : null}

                </div>



                <div className="space-y-2">

                    <p className="text-sm font-medium text-content-secondary">

                        Gallery images

                    </p>

                    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-theme-page px-4 text-center transition hover:border-brand-orange hover:bg-brand-orange/5">

                        <ImageIcon size={22} className="text-content-muted" />

                        <span className="mt-2 text-sm font-semibold text-content-secondary">

                            Add gallery images

                        </span>

                        <input

                            type="file"

                            multiple

                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"

                            className="sr-only"

                            onChange={(event) =>

                                setGalleryImages(

                                    Array.from(event.target.files || [])

                                )

                            }

                        />

                    </label>

                    {galleryPreviews.length > 0 || existingGallery.length > 0 ? (

                        <div className="grid grid-cols-4 gap-2">

                            {(galleryPreviews.length > 0

                                ? galleryPreviews

                                : existingGallery

                            ).map((url) => (

                                <img

                                    key={url}

                                    src={url}

                                    alt=""

                                    className="h-16 w-full rounded-lg border border-line object-cover"

                                />

                            ))}

                        </div>

                    ) : null}

                </div>

            </div>



            <div className="flex justify-end gap-3 border-t border-line pt-4">

                {onCancel ? (

                    <button

                        type="button"

                        onClick={onCancel}

                        disabled={saving}

                        className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-content-secondary transition hover:bg-theme-page disabled:opacity-60"

                    >

                        Cancel

                    </button>

                ) : null}

                <button

                    type="submit"

                    disabled={saving}

                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:opacity-60"

                >

                    {saving ? (

                        <LoaderCircle size={16} className="animate-spin" />

                    ) : null}

                    {submitLabel}

                </button>

            </div>

        </form>

    );

};



export default ProductForm;

