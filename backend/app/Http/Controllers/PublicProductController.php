<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicProductResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicProductController extends Controller
{
    /**
     * Display published products for public visitors.
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],

            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => [
                'nullable',
                'numeric',
                'min:0',
                'gte:min_price',
            ],

            'sort' => [
                'nullable',
                Rule::in([
                    'latest',
                    'oldest',
                    'price_asc',
                    'price_desc',
                    'title_asc',
                    'title_desc',
                ]),
            ],

            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $query = Post::query()
            ->where('status', 'published');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('country_of_origin', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['brand'])) {
            $query->where('brand', $filters['brand']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        $this->applySorting(
            $query,
            $filters['sort'] ?? 'latest'
        );

        $products = $query->paginate(
            $filters['per_page'] ?? 12
        )->withQueryString();

        return PublicProductResource::collection($products);
    }

    /**
     * Display a single published product.
     */
    public function show(int $id)
    {
        $product = Post::query()
            ->where('status', 'published')
            ->findOrFail($id);

        return new PublicProductResource($product);
    }

    /**
     * Apply requested product sorting.
     */
    private function applySorting($query, string $sort): void
    {
        match ($sort) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'price_asc' => $query
                ->orderByRaw('CASE WHEN price IS NULL THEN 1 ELSE 0 END')
                ->orderBy('price', 'asc'),
            'price_desc' => $query
                ->orderByRaw('CASE WHEN price IS NULL THEN 1 ELSE 0 END')
                ->orderBy('price', 'desc'),
            'title_asc' => $query->orderBy('title', 'asc'),
            'title_desc' => $query->orderBy('title', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };
    }
}
