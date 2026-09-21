<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'category',
        'brand',
        'sku',
        'price',
        'currency',
        'moq',
        'unit',
        'country_of_origin',
        'hs_code',
        'lead_time',
        'payment_terms',
        'shipping_terms',
        'sample_available',
        'certifications',
        'main_image',
        'gallery_images',
        'status',
        'reject_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'moq' => 'integer',
        'gallery_images' => 'array',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'main_image_url',
        'gallery_image_urls',
    ];

    public function getMainImageUrlAttribute(): ?string
    {
        return $this->resolveImageUrl($this->main_image);
    }

    public function getGalleryImageUrlsAttribute(): array
    {
        if (
            empty($this->gallery_images) ||
            !is_array($this->gallery_images)
        ) {
            return [];
        }

        return collect($this->gallery_images)
            ->filter()
            ->map(fn($path) => $this->resolveImageUrl($path))
            ->filter()
            ->values()
            ->all();
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // Keep an already complete URL unchanged.
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        $normalizedPath = ltrim($path, '/');

        // Prevent duplicate "storage/storage" paths.
        if (str_starts_with($normalizedPath, 'storage/')) {
            $normalizedPath = substr($normalizedPath, strlen('storage/'));
        }

        $relativeUrl = Storage::disk('public')->url($normalizedPath);

        return url($relativeUrl);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('status', ProductReview::STATUS_APPROVED);
    }

    public function scopeWithReviewStats($query)
    {
        return $query
            ->withCount(['approvedReviews as review_count'])
            ->withAvg('approvedReviews', 'rating');
    }
}
