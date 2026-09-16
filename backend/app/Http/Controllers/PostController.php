<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,published,rejected'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
        ]);

        $query = Post::query()
            ->with(['user:id,name,email', 'reviewer'])
            ->when(
                ! empty($filters['status']),
                fn ($posts) => $posts->where('status', $filters['status'])
            )
            ->when(
                ! empty($filters['from_date']),
                fn ($posts) => $posts->whereDate('created_at', '>=', $filters['from_date'])
            )
            ->when(
                ! empty($filters['to_date']),
                fn ($posts) => $posts->whereDate('created_at', '<=', $filters['to_date'])
            );

        return response()->json([
            'data' => $query->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateProductPayload($request);

        if ($request->hasFile('main_image')) {
            $data['main_image'] = $request
                ->file('main_image')
                ->store('products/main', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            $data['gallery_images'] = $this->storeGalleryImages($request);
        }

        $post = Post::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'published',
            'reject_reason' => null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'data' => $post->load(['user', 'reviewer']),
            'message' => 'Product published successfully.',
        ], 201);
    }

    public function show($id)
    {
        $post = Post::with(['user', 'reviewer'])->findOrFail($id);

        return response()->json([
            'data' => $post,
        ]);
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'moq' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:255'],
            'country_of_origin' => ['nullable', 'string', 'max:255'],
            'hs_code' => ['nullable', 'string', 'max:255'],
            'lead_time' => ['nullable', 'string', 'max:255'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'shipping_terms' => ['nullable', 'string', 'max:255'],
            'sample_available' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'string'],

            'main_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],

            'status' => ['sometimes', 'string', 'in:pending,published,rejected'],
            'reject_reason' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('main_image')) {
            $this->deleteFile($post->main_image);

            $data['main_image'] = $request
                ->file('main_image')
                ->store('products/main', 'public');
        }

        if ($request->hasFile('gallery_images')) {
            $this->deleteGalleryImages($post);

            $data['gallery_images'] = $this->storeGalleryImages($request);
        }

        if (isset($data['status'])) {
            $data['reviewed_by'] = $request->user()->id;
            $data['reviewed_at'] = now();

            if ($data['status'] === 'published') {
                $data['reject_reason'] = null;
            }
        }

        $post->update($data);

        return response()->json([
            'data' => $post->fresh(['user', 'reviewer']),
            'message' => 'Product updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        $this->deletePostImages($post);

        $post->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function validateProductPayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'category' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'moq' => ['required', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:255'],
            'country_of_origin' => ['nullable', 'string', 'max:255'],
            'hs_code' => ['nullable', 'string', 'max:255'],
            'lead_time' => ['nullable', 'string', 'max:255'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'shipping_terms' => ['nullable', 'string', 'max:255'],
            'sample_available' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'string'],

            'main_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
    }

    private function storeGalleryImages(Request $request): array
    {
        $paths = [];

        foreach ($request->file('gallery_images', []) as $image) {
            $paths[] = $image->store('products/gallery', 'public');
        }

        return $paths;
    }

    private function deletePostImages(Post $post): void
    {
        $this->deleteFile($post->main_image);
        $this->deleteGalleryImages($post);
    }

    private function deleteGalleryImages(Post $post): void
    {
        if (! $post->gallery_images || ! is_array($post->gallery_images)) {
            return;
        }

        foreach ($post->gallery_images as $path) {
            $this->deleteFile($path);
        }
    }

    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
