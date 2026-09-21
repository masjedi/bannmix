<?php

namespace App\Services;

use App\Models\SiteContent;
use Illuminate\Support\Facades\Cache;

/**
 * Public CMS and feedback response cache.
 *
 * Cache keys:
 * - site-content:public:{page}:{locale}:{section|null}
 * - public:feedback:approved:{limit}
 *
 * Invalidation:
 * - SiteContentController mutations call forgetPage() for affected page(s)
 * - events page changes also invalidate home (home embeds events items)
 * - SiteFeedbackController status changes call forgetApprovedFeedback()
 */
class PublicContentCache
{
    public const TTL_SECONDS = 3600;

    private const LOCALES = ['en', 'ps', 'fa'];

    /**
     * Pages whose public payload is embedded inside another page response.
     *
     * @var array<string, list<string>>
     */
    private const RELATED_PAGES = [
        'events' => ['home'],
    ];

    public static function pageKey(
        string $page,
        string $locale,
        ?string $section = null
    ): string {
        return sprintf(
            'site-content:public:%s:%s:%s',
            $page,
            $locale,
            $section ?? '_all_'
        );
    }

    public static function feedbackKey(int $limit): string
    {
        return 'public:feedback:approved:' . $limit;
    }

    /**
     * @param  callable(): array<string, mixed>  $callback
     * @return array<string, mixed>
     */
    public static function rememberPage(
        string $page,
        string $locale,
        ?string $section,
        callable $callback
    ): array {
        return Cache::remember(
            self::pageKey($page, $locale, $section),
            self::TTL_SECONDS,
            $callback
        );
    }

    /**
     * @param  callable(): list<array<string, mixed>>  $callback
     * @return list<array<string, mixed>>
     */
    public static function rememberApprovedFeedback(
        int $limit,
        callable $callback
    ): array {
        return Cache::remember(
            self::feedbackKey($limit),
            self::TTL_SECONDS,
            $callback
        );
    }

    public static function forgetPage(string $page): void
    {
        $sections = SiteContent::query()
            ->where('page', $page)
            ->distinct()
            ->pluck('section')
            ->filter()
            ->values()
            ->all();

        foreach (self::LOCALES as $locale) {
            Cache::forget(self::pageKey($page, $locale, null));

            foreach ($sections as $section) {
                Cache::forget(
                    self::pageKey($page, $locale, (string) $section)
                );
            }
        }

        foreach (self::RELATED_PAGES[$page] ?? [] as $relatedPage) {
            self::forgetPage($relatedPage);
        }
    }

    public static function forgetApprovedFeedback(): void
    {
        for ($limit = 1; $limit <= 24; $limit++) {
            Cache::forget(self::feedbackKey($limit));
        }
    }
}
