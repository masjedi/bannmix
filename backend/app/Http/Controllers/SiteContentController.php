<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiteContentRequest;
use App\Models\SiteContent;
use App\Services\PublicContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SiteContentController extends Controller
{
    /**
     * Supported website languages.
     */
    private const SUPPORTED_LOCALES = [
        'en',
        'ps',
        'fa',
    ];

    /**
     * Admin: list all website content.
     *
     * Supported filters:
     * - page
     * - section
     * - is_active
     * - search
     * - per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = SiteContent::query()
            ->when(
                $request->filled('content_page'),
                fn($builder) => $builder->forContentPage(
                    $this->normalizeIdentifier(
                        $request->string('content_page')->toString()
                    )
                )
            )
            ->when(
                $request->filled('section'),
                fn($builder) => $builder->forSection(
                    $this->normalizeIdentifier(
                        $request->string('section')->toString()
                    )
                )
            )
            ->when(
                $request->has('is_active'),
                function ($builder) use ($request) {
                    $isActive = filter_var(
                        $request->input('is_active'),
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE
                    );

                    if ($isActive !== null) {
                        $builder->where('is_active', $isActive);
                    }
                }
            )
            ->when(
                $request->filled('search'),
                function ($builder) use ($request) {
                    $search = trim(
                        $request->string('search')->toString()
                    );

                    $builder->where(function ($searchQuery) use ($search) {
                        $searchQuery
                            ->where('page', 'like', "%{$search}%")
                            ->orWhere('section', 'like', "%{$search}%")
                            ->orWhere('content_key', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%")
                            ->orWhere('subtitle', 'like', "%{$search}%")
                            ->orWhere('content', 'like', "%{$search}%");
                    });
                }
            )
            ->orderBy('page')
            ->orderBy('section')
            ->ordered();

        $perPage = min(
            max((int) $request->input('per_page', 25), 1),
            100
        );

        $contents = $query->paginate($perPage);

        $contents->getCollection()->transform(
            fn(SiteContent $siteContent) =>
            $this->adminContentResource($siteContent)
        );

        return response()->json([
            'message' => 'Website content retrieved successfully.',
            'data' => $contents->items(),
            'meta' => [
                'current_page' => $contents->currentPage(),
                'last_page' => $contents->lastPage(),
                'per_page' => $contents->perPage(),
                'total' => $contents->total(),
                'from' => $contents->firstItem(),
                'to' => $contents->lastItem(),
            ],
        ]);
    }

    /**
     * Public: return active content for one website page.
     *
     * Examples:
     * GET /api/public/content/home
     * GET /api/public/content/home?lang=ps
     * GET /api/public/content/home?section=banners
     */
    public function publicPage(
        Request $request,
        string $page
    ): JsonResponse {
        $page = $this->normalizeIdentifier($page);
        $locale = $this->resolveLocale($request);
        $section = $request->filled('section')
            ? $this->normalizeIdentifier(
                $request->string('section')->toString()
            )
            : null;

        $payload = PublicContentCache::rememberPage(
            $page,
            $locale,
            $section,
            fn() => $this->buildPublicPagePayload(
                $page,
                $locale,
                $section
            )
        );

        return response()->json([
            'message' => 'Public website content retrieved successfully.',
            'data' => $payload,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    /**
     * Build localized public page payload.
     *
     * @return array<string, mixed>
     */
    private function buildPublicPagePayload(
        string $page,
        string $locale,
        ?string $section = null
    ): array {
        $contents = $this->queryPublicPageContents($page, $section)
            ->map(
                fn(SiteContent $siteContent) =>
                $this->publicContentResource(
                    $siteContent,
                    $locale
                )
            )
            ->values();

        $sections = $contents
            ->groupBy('section')
            ->map(
                fn($items) => $items->values()->all()
            )
            ->all();

        $payload = [
            'page' => $page,
            'locale' => $locale,
            'direction' => in_array(
                $locale,
                ['ps', 'fa'],
                true
            ) ? 'rtl' : 'ltr',
            'sections' => $sections,
            'items' => $contents->all(),
        ];

        if ($page === 'home' && $section === null) {
            $eventItems = $this->queryPublicPageContents('events', 'items')
                ->map(
                    fn(SiteContent $siteContent) =>
                    $this->publicContentResource(
                        $siteContent,
                        $locale
                    )
                )
                ->values()
                ->all();

            $payload['includes'] = [
                'events' => [
                    'sections' => [
                        'items' => $eventItems,
                    ],
                ],
            ];
        }

        return $payload;
    }

    /**
     * @return Collection<int, SiteContent>
     */
    private function queryPublicPageContents(
        string $page,
        ?string $section = null
    ): Collection {
        return SiteContent::query()
            ->active()
            ->forContentPage($page)
            ->when(
                $section !== null,
                fn($builder) => $builder->forSection($section)
            )
            ->ordered()
            ->get();
    }

    /**
     * Admin: show a single website content record.
     */
    public function show(
        SiteContent $siteContent
    ): JsonResponse {
        return response()->json([
            'message' => 'Website content retrieved successfully.',
            'data' => $this->adminContentResource(
                $siteContent
            ),
        ]);
    }

    /**
     * Admin: create a website content record.
     */
    public function store(
        StoreSiteContentRequest $request
    ): JsonResponse {
        $validated = $request->validated();
        $uploadedPaths = [];

        try {
            $this->applyUploadedImages(
                $request,
                $validated
            );

            $uploadedPaths = is_array($validated['metadata']['images'] ?? null)
                ? $validated['metadata']['images']
                : [];

            unset(
                $validated['image'],
                $validated['images'],
                $validated['removed_image_paths'],
                $validated['remove_image']
            );

            $siteContent = DB::transaction(
                fn() => SiteContent::create([
                    ...$validated,
                    'sort_order' => $validated['sort_order'] ?? 0,
                    'is_active' => $validated['is_active'] ?? true,
                ])
            );

            PublicContentCache::forgetPage($siteContent->page);

            return response()->json([
                'message' => 'Website content created successfully.',
                'data' => $this->adminContentResource(
                    $siteContent
                ),
            ], 201);
        } catch (Throwable $exception) {
            foreach ($uploadedPaths as $uploadedPath) {
                $this->deleteStoredImage($uploadedPath);
            }

            throw $exception;
        }
    }

    /**
     * Admin: update a website content record.
     */
    public function update(
        StoreSiteContentRequest $request,
        SiteContent $siteContent
    ): JsonResponse {
        $validated = $request->validated();
        $uploadedPaths = [];
        $previousPage = $siteContent->page;

        try {
            $previousPaths = $this->collectImagePaths(
                $siteContent->image_path,
                $siteContent->metadata ?? []
            );

            $this->applyUploadedImages(
                $request,
                $validated,
                $siteContent
            );

            $nextPaths = $this->collectImagePaths(
                $validated['image_path'] ?? $siteContent->image_path,
                $validated['metadata'] ?? $siteContent->metadata ?? []
            );

            $uploadedPaths = array_values(
                array_diff($nextPaths, $previousPaths)
            );

            $shouldRemoveOldImage = $previousPaths !== $nextPaths;

            unset(
                $validated['image'],
                $validated['images'],
                $validated['removed_image_paths'],
                $validated['remove_image']
            );

            DB::transaction(function () use (
                $siteContent,
                $validated
            ): void {
                $siteContent->update($validated);
            });

            if ($shouldRemoveOldImage) {
                foreach ($previousPaths as $path) {
                    if (!in_array($path, $nextPaths, true)) {
                        $this->deleteStoredImage($path);
                    }
                }
            }

            PublicContentCache::forgetPage($siteContent->fresh()->page);

            if (
                isset($validated['page']) &&
                $validated['page'] !== $previousPage
            ) {
                PublicContentCache::forgetPage($previousPage);
            }

            return response()->json([
                'message' => 'Website content updated successfully.',
                'data' => $this->adminContentResource(
                    $siteContent->fresh()
                ),
            ]);
        } catch (Throwable $exception) {
            foreach ($uploadedPaths as $uploadedPath) {
                $this->deleteStoredImage($uploadedPath);
            }

            throw $exception;
        }
    }

    /**
     * Admin: delete a website content record.
     */
    public function destroy(
        SiteContent $siteContent
    ): JsonResponse {
        $page = $siteContent->page;

        $imagePaths = $this->collectImagePaths(
            $siteContent->image_path,
            $siteContent->metadata ?? []
        );

        DB::transaction(function () use ($siteContent): void {
            $siteContent->delete();
        });

        foreach ($imagePaths as $imagePath) {
            $this->deleteStoredImage($imagePath);
        }

        PublicContentCache::forgetPage($page);

        return response()->json([
            'message' => 'Website content deleted successfully.',
        ]);
    }

    /**
     * Admin: update only the active status.
     */
    public function updateStatus(
        Request $request,
        SiteContent $siteContent
    ): JsonResponse {
        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $siteContent->update([
            'is_active' => $validated['is_active'],
        ]);

        PublicContentCache::forgetPage($siteContent->page);

        return response()->json([
            'message' => $siteContent->is_active
                ? 'Website content activated successfully.'
                : 'Website content deactivated successfully.',
            'data' => $this->adminContentResource(
                $siteContent->fresh()
            ),
        ]);
    }

    /**
     * Admin: update the ordering of multiple content records.
     *
     * Request:
     * {
     *     "items": [
     *         {"id": 1, "sort_order": 0},
     *         {"id": 2, "sort_order": 1}
     *     ]
     * }
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => [
                'required',
                'array',
                'min:1',
            ],
            'items.*.id' => [
                'required',
                'integer',
                'exists:site_contents,id',
            ],
            'items.*.sort_order' => [
                'required',
                'integer',
                'min:0',
            ],
        ]);

        $affectedPages = SiteContent::query()
            ->whereIn(
                'id',
                collect($validated['items'])->pluck('id')
            )
            ->distinct()
            ->pluck('page');

        DB::transaction(function () use ($validated): void {
            foreach ($validated['items'] as $item) {
                SiteContent::query()
                    ->whereKey($item['id'])
                    ->update([
                        'sort_order' => $item['sort_order'],
                    ]);
            }
        });

        foreach ($affectedPages as $affectedPage) {
            PublicContentCache::forgetPage((string) $affectedPage);
        }

        return response()->json([
            'message' => 'Website content order updated successfully.',
        ]);
    }

    /**
     * Full multilingual response used by the admin panel.
     */
    private function adminContentResource(
        SiteContent $siteContent
    ): array {
        return [
            'id' => $siteContent->id,
            'page' => $siteContent->page,
            'section' => $siteContent->section,
            'content_key' => $siteContent->content_key,

            'title' => $siteContent->title ?? [
                'en' => '',
                'ps' => '',
                'fa' => '',
            ],

            'subtitle' => $siteContent->subtitle ?? [
                'en' => '',
                'ps' => '',
                'fa' => '',
            ],

            'content' => $siteContent->content ?? [
                'en' => '',
                'ps' => '',
                'fa' => '',
            ],

            'button_text' => $siteContent->button_text ?? [
                'en' => '',
                'ps' => '',
                'fa' => '',
            ],

            'button_url' => $siteContent->button_url,
            'image_path' => $siteContent->image_path,
            'image_url' => $this->resolveMediaUrl(
                $siteContent->image_path
            ),
            'image_urls' => $this->resolveImageUrls(
                $siteContent->image_path,
                $siteContent->metadata ?? []
            ),
            'video_url' => $siteContent->video_url,
            'metadata' => $siteContent->metadata ?? [],
            'sort_order' => $siteContent->sort_order,
            'is_active' => $siteContent->is_active,
            'created_at' => $siteContent->created_at,
            'updated_at' => $siteContent->updated_at,
        ];
    }

    /**
     * Localized response used by the public website.
     */
    private function publicContentResource(
        SiteContent $siteContent,
        string $locale
    ): array {
        return [
            'id' => $siteContent->id,
            'section' => $siteContent->section,
            'content_key' => $siteContent->content_key,

            'title' => $siteContent->translated(
                'title',
                $locale
            ),

            'subtitle' => $siteContent->translated(
                'subtitle',
                $locale
            ),

            'content' => $siteContent->translated(
                'content',
                $locale
            ),

            'button_text' => $siteContent->translated(
                'button_text',
                $locale
            ),

            'button_url' => $siteContent->button_url,
            'image_url' => $this->resolveMediaUrl(
                $siteContent->image_path
            ),
            'image_urls' => $this->resolveImageUrls(
                $siteContent->image_path,
                $siteContent->metadata ?? []
            ),
            'video_url' => $siteContent->video_url,
            'metadata' => $siteContent->metadata ?? [],
            'sort_order' => $siteContent->sort_order,
        ];
    }

    /**
     * Merge uploaded, existing, and removed images into validated payload.
     */
    private function applyUploadedImages(
        Request $request,
        array &$validated,
        ?SiteContent $siteContent = null
    ): void {
        $page = $validated['page'] ?? $siteContent?->page ?? '';
        $section = $validated['section'] ?? $siteContent?->section ?? '';

        $metadata = is_array($siteContent?->metadata)
            ? $siteContent->metadata
            : [];

        if (
            isset($validated['metadata']) &&
            is_array($validated['metadata']) &&
            $validated['metadata'] !== []
        ) {
            $metadata = array_merge($metadata, $validated['metadata']);
        }

        $imagePaths = $this->collectImagePaths(
            $siteContent?->image_path,
            $metadata
        );

        $removedPaths = $validated['removed_image_paths'] ?? [];

        if (is_array($removedPaths) && !empty($removedPaths)) {
            $imagePaths = array_values(
                array_filter(
                    $imagePaths,
                    fn(string $path) => !in_array(
                        $path,
                        $removedPaths,
                        true
                    )
                )
            );
        }

        if ($request->hasFile('image')) {
            $imagePaths[] = $this->storeImage(
                $request->file('image'),
                $page,
                $section
            );
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $uploadedImage) {
                $imagePaths[] = $this->storeImage(
                    $uploadedImage,
                    $page,
                    $section
                );
            }
        }

        if (
            $request->boolean('remove_image') &&
            !$request->hasFile('image') &&
            !$request->hasFile('images')
        ) {
            $imagePaths = [];
        }

        $imagePaths = array_values(
            array_unique(
                array_filter($imagePaths)
            )
        );

        $validated['image_path'] = $imagePaths[0] ?? null;
        $metadata['images'] = $imagePaths;
        $validated['metadata'] = $metadata;
    }

    /**
     * Collect unique stored image paths from primary and metadata fields.
     *
     * @param  array<string, mixed>  $metadata
     * @return list<string>
     */
    private function collectImagePaths(
        ?string $primaryPath,
        array $metadata
    ): array {
        $paths = [];

        if ($primaryPath) {
            $paths[] = $primaryPath;
        }

        $metadataImages = $metadata['images'] ?? [];

        if (is_array($metadataImages)) {
            foreach ($metadataImages as $path) {
                if (
                    is_string($path) &&
                    $path !== '' &&
                    !in_array($path, $paths, true)
                ) {
                    $paths[] = $path;
                }
            }
        }

        return $paths;
    }

    /**
     * Resolve all image paths to public URLs.
     *
     * @param  array<string, mixed>  $metadata
     * @return list<string>
     */
    private function resolveImageUrls(
        ?string $primaryPath,
        array $metadata
    ): array {
        return array_values(
            array_filter(
                array_map(
                    fn(string $path) => $this->resolveMediaUrl($path),
                    $this->collectImagePaths($primaryPath, $metadata)
                )
            )
        );
    }

    /**
     * Save an uploaded content image.
     */
    private function storeImage(
        mixed $image,
        string $page,
        string $section
    ): string {
        return $image->store(
            "site-content/{$page}/{$section}",
            'public'
        );
    }

    /**
     * Delete only locally stored public-disk images.
     */
    private function deleteStoredImage(
        ?string $imagePath
    ): void {
        if (!$imagePath) {
            return;
        }

        if (
            str_starts_with($imagePath, 'http://') ||
            str_starts_with($imagePath, 'https://')
        ) {
            return;
        }

        if (Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    /**
     * Convert a stored path into a public URL.
     */
    private function resolveMediaUrl(
        ?string $path
    ): ?string {
        if (!$path) {
            return null;
        }

        if (
            str_starts_with($path, 'http://') ||
            str_starts_with($path, 'https://')
        ) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Resolve the requested public language.
     */
    private function resolveLocale(
        Request $request
    ): string {
        $requestedLocale =
            $request->query('lang') ??
            $request->header('X-Language') ??
            $request->header('Accept-Language') ??
            app()->getLocale();

        $requestedLocale = strtolower(
            substr((string) $requestedLocale, 0, 2)
        );

        if (
            !in_array(
                $requestedLocale,
                self::SUPPORTED_LOCALES,
                true
            )
        ) {
            return 'en';
        }

        app()->setLocale($requestedLocale);

        return $requestedLocale;
    }

    /**
     * Normalize route and filter identifiers.
     */
    private function normalizeIdentifier(
        string $value
    ): string {
        return strtolower(
            preg_replace(
                '/[^a-zA-Z0-9]+/',
                '_',
                trim($value)
            )
        );
    }
}
