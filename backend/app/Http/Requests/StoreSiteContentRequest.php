<?php

namespace App\Http\Requests;

use App\Models\SiteContent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSiteContentRequest extends FormRequest
{
    /**
     * Authorization will be handled by the protected admin route
     * and admin middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare multipart/form-data and normal JSON requests for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'page' => $this->normalizeIdentifier(
                $this->input('page')
            ),

            'section' => $this->normalizeIdentifier(
                $this->input('section')
            ),

            'content_key' => $this->normalizeIdentifier(
                $this->input('content_key'),
                true
            ),

            'title' => $this->decodeJsonField('title'),
            'subtitle' => $this->decodeJsonField('subtitle'),
            'content' => $this->decodeJsonField('content'),
            'button_text' => $this->decodeJsonField(
                'button_text'
            ),
            'metadata' => $this->decodeJsonField(
                'metadata'
            ),
        ]);

        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var(
                    $this->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        if ($this->has('remove_image')) {
            $this->merge([
                'remove_image' => filter_var(
                    $this->input('remove_image'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ),
            ]);
        }

        $this->merge([
            'removed_image_paths' => $this->decodeJsonField(
                'removed_image_paths'
            ),
        ]);
    }

    /**
     * Validation rules for both create and update operations.
     */
    public function rules(): array
    {
        $contentId = $this->resolveSiteContentId();

        $contentKeyRule = Rule::unique(
            'site_contents',
            'content_key'
        )
            ->where(function ($query) {
                return $query
                    ->where('page', $this->input('page'))
                    ->where(
                        'section',
                        $this->input('section')
                    );
            })
            ->ignore($contentId);

        return [
            'page' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9_]+$/',
            ],

            'section' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9_]+$/',
            ],

            'content_key' => [
                'nullable',
                'string',
                'max:150',
                'regex:/^[a-z0-9_]+$/',
                $contentKeyRule,
            ],

            'title' => [
                'nullable',
                'array',
            ],
            'title.en' => [
                'nullable',
                'string',
                'max:255',
            ],
            'title.ps' => [
                'nullable',
                'string',
                'max:255',
            ],
            'title.fa' => [
                'nullable',
                'string',
                'max:255',
            ],

            'subtitle' => [
                'nullable',
                'array',
            ],
            'subtitle.en' => [
                'nullable',
                'string',
                'max:500',
            ],
            'subtitle.ps' => [
                'nullable',
                'string',
                'max:500',
            ],
            'subtitle.fa' => [
                'nullable',
                'string',
                'max:500',
            ],

            'content' => [
                'nullable',
                'array',
            ],
            'content.en' => [
                'nullable',
                'string',
            ],
            'content.ps' => [
                'nullable',
                'string',
            ],
            'content.fa' => [
                'nullable',
                'string',
            ],

            'button_text' => [
                'nullable',
                'array',
            ],
            'button_text.en' => [
                'nullable',
                'string',
                'max:150',
            ],
            'button_text.ps' => [
                'nullable',
                'string',
                'max:150',
            ],
            'button_text.fa' => [
                'nullable',
                'string',
                'max:150',
            ],

            /*
             * Relative website paths and absolute URLs are both allowed.
             *
             * Examples:
             * /products
             * /contact
             * https://example.com/page
             */
            'button_url' => [
                'nullable',
                'string',
                'max:500',
            ],

            /*
             * The controller will store this file and save its path
             * into the image_path database column.
             */
            'image' => [
                'nullable',
                'file',
                'mimetypes:image/*',
                'max:5120',
            ],

            'images' => [
                'nullable',
                'array',
            ],
            'images.*' => [
                'file',
                'mimetypes:image/*',
                'max:5120',
            ],

            'removed_image_paths' => [
                'nullable',
                'array',
            ],
            'removed_image_paths.*' => [
                'string',
                'max:500',
            ],

            /*
             * Existing image path can be preserved when the request
             * does not contain a new image.
             */
            'image_path' => [
                'nullable',
                'string',
                'max:500',
            ],

            'remove_image' => [
                'sometimes',
                'boolean',
            ],

            'video_url' => [
                'nullable',
                'url',
                'max:1000',
            ],

            'metadata' => [
                'nullable',
                'array',
            ],

            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Additional multilingual content validation.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $translationFields = [
                    'title',
                    'subtitle',
                    'content',
                    'button_text',
                ];

                if ($this->input('section') === 'intro_video') {
                    $videoUrl = trim((string) $this->input('video_url', ''));
                    $isActive = filter_var(
                        $this->input('is_active', true),
                        FILTER_VALIDATE_BOOLEAN
                    );

                    if ($isActive && $videoUrl === '') {
                        $validator->errors()->add(
                            'video_url',
                            'A YouTube URL is required while the intro video section is visible.'
                        );
                    }

                    if (
                        $videoUrl !== '' &&
                        !preg_match(
                            '/^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[\/?&#].*)?$/i',
                            $videoUrl
                        )
                    ) {
                        $validator->errors()->add(
                            'video_url',
                            'Enter a valid YouTube watch, youtu.be, or embed URL.'
                        );
                    }
                }

                /*
                 * Prevent empty content records during creation.
                 * On updates, changing only status or sorting is allowed.
                 */
                if ($this->isMethod('post')) {
                    $hasTranslatedContent = collect(
                        $translationFields
                    )->contains(function (string $field) {
                        $value = $this->input($field);

                        return is_array($value) &&
                            $this->hasTranslation($value);
                    });

                    $hasMedia =
                        $this->hasFile('image') ||
                        $this->hasFile('images') ||
                        filled($this->input('image_path')) ||
                        filled($this->input('video_url'));

                    if (
                        !$hasTranslatedContent &&
                        !$hasMedia
                    ) {
                        $validator->errors()->add(
                            'content',
                            'At least one translated content field, image, or video URL is required.'
                        );
                    }
                }
            },
        ];
    }

    /**
     * Validation error messages.
     */
    public function messages(): array
    {
        return [
            'page.required' =>
            'The website page is required.',
            'page.regex' =>
            'The page may contain only lowercase letters, numbers, and underscores.',

            'section.required' =>
            'The page section is required.',
            'section.regex' =>
            'The section may contain only lowercase letters, numbers, and underscores.',

            'content_key.regex' =>
            'The content key may contain only lowercase letters, numbers, and underscores.',
            'content_key.unique' =>
            'This content key already exists in the selected page and section.',

            'title.array' =>
            'The title must contain multilingual values.',
            'subtitle.array' =>
            'The subtitle must contain multilingual values.',
            'content.array' =>
            'The content must contain multilingual values.',
            'button_text.array' =>
            'The button text must contain multilingual values.',

            'image.file' =>
            'The uploaded image must be a valid file.',
            'image.mimetypes' =>
            'The uploaded file must have a valid image MIME type.',
            'image.max' =>
            'The image size must not exceed 5 MB.',

            'video_url.url' =>
            'The video URL must be a valid URL.',

            'sort_order.integer' =>
            'The sort order must be a whole number.',
            'sort_order.min' =>
            'The sort order cannot be negative.',
        ];
    }

    /**
     * Human-readable validation attribute names.
     */
    public function attributes(): array
    {
        return [
            'title.en' => 'English title',
            'title.ps' => 'Pashto title',
            'title.fa' => 'Dari title',

            'subtitle.en' => 'English subtitle',
            'subtitle.ps' => 'Pashto subtitle',
            'subtitle.fa' => 'Dari subtitle',

            'content.en' => 'English content',
            'content.ps' => 'Pashto content',
            'content.fa' => 'Dari content',

            'button_text.en' => 'English button text',
            'button_text.ps' => 'Pashto button text',
            'button_text.fa' => 'Dari button text',
        ];
    }

    /**
     * Decode JSON strings submitted through FormData.
     */
    private function decodeJsonField(string $field): mixed
    {
        $value = $this->input($field);

        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        if (!is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE
            ? $decoded
            : $value;
    }

    /**
     * Normalize page, section, and content-key identifiers.
     */
    private function normalizeIdentifier(
        mixed $value,
        bool $nullable = false
    ): ?string {
        if ($value === null || trim((string) $value) === '') {
            return $nullable ? null : '';
        }

        $normalized = Str::of($value)
            ->trim()
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->replaceMatches('/_+/', '_')
            ->trim('_')
            ->limit(150, '')
            ->toString();

        if ($normalized === '') {
            return $nullable ? null : '';
        }

        return $normalized;
    }

    /**
     * Check whether a multilingual field contains a translation.
     */
    private function hasTranslation(array $translations): bool
    {
        foreach (['en', 'ps', 'fa'] as $locale) {
            if (
                isset($translations[$locale]) &&
                is_string($translations[$locale]) &&
                trim($translations[$locale]) !== ''
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve the current content ID for update uniqueness validation.
     */
    private function resolveSiteContentId(): ?int
    {
        $routeValue =
            $this->route('siteContent') ??
            $this->route('site_content') ??
            $this->route('content');

        if ($routeValue instanceof SiteContent) {
            return $routeValue->id;
        }

        return is_numeric($routeValue)
            ? (int) $routeValue
            : null;
    }
}
