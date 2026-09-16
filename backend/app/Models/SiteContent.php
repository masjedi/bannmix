<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    use HasFactory;

    /**
     * Fields allowed for mass assignment.
     */
    protected $fillable = [
        'page',
        'section',
        'content_key',
        'title',
        'subtitle',
        'content',
        'button_text',
        'button_url',
        'image_path',
        'video_url',
        'metadata',
        'sort_order',
        'is_active',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'title' => 'array',
            'subtitle' => 'array',
            'content' => 'array',
            'button_text' => 'array',
            'metadata' => 'array',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Return only active content records.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Filter content by website page.
     */
    public function scopeForContentPage(
        Builder $query,
        string $page
    ): Builder {
        return $query->where('page', $page);
    }

    /**
     * Filter content by page section.
     */
    public function scopeForSection(
        Builder $query,
        string $section
    ): Builder {
        return $query->where('section', $section);
    }

    /**
     * Order content records for website display.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Get a translated value from a multilingual JSON field.
     *
     * Falls back to English, then to the first available translation.
     */
    public function translated(
        string $field,
        ?string $locale = null
    ): ?string {
        $translations = $this->getAttribute($field);

        if (!is_array($translations) || empty($translations)) {
            return null;
        }

        $locale = $locale ?: app()->getLocale();

        return $translations[$locale]
            ?? $translations['en']
            ?? collect($translations)
            ->first(
                fn($value) => is_string($value) && trim($value) !== ''
            );
    }

    /**
     * Convert this content record into a localized array.
     */
    public function toLocalizedArray(
        ?string $locale = null
    ): array {
        $locale = $locale ?: app()->getLocale();

        return [
            'id' => $this->id,
            'page' => $this->page,
            'section' => $this->section,
            'content_key' => $this->content_key,

            'title' => $this->translated('title', $locale),
            'subtitle' => $this->translated('subtitle', $locale),
            'content' => $this->translated('content', $locale),
            'button_text' => $this->translated(
                'button_text',
                $locale
            ),

            'button_url' => $this->button_url,
            'image_path' => $this->image_path,
            'video_url' => $this->video_url,
            'metadata' => $this->metadata ?? [],
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
