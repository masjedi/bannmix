<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductReviewRequest;
use App\Http\Resources\ProductReviewResource;
use App\Models\Post;
use App\Models\ProductReview;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;

class PublicProductReviewController extends Controller
{
    public function index(Request $request, int $id)
    {
        $product = Post::query()
            ->where('status', 'published')
            ->findOrFail($id);

        $reviews = $product->approvedReviews()
            ->latest()
            ->paginate(
                min((int) $request->integer('per_page', 10), 20)
            );

        return ProductReviewResource::collection($reviews);
    }

    public function store(StoreProductReviewRequest $request, int $id)
    {
        $product = Post::query()
            ->where('status', 'published')
            ->findOrFail($id);

        $review = $product->reviews()->create([
            'reviewer_name' => trim($request->string('reviewer_name')->toString()),
            'reviewer_email' => $request->filled('reviewer_email')
                ? trim($request->string('reviewer_email')->toString())
                : null,
            'rating' => (int) $request->integer('rating'),
            'comment' => $request->filled('comment')
                ? trim($request->string('comment')->toString())
                : null,
            'status' => ProductReview::STATUS_PENDING,
            'ip_address' => $request->ip(),
        ]);

        AdminNotificationService::notifyProductReview($review);

        return response()->json([
            'data' => new ProductReviewResource($review),
            'message' => 'Thank you. Your review has been submitted and is awaiting approval.',
        ], 201);
    }
}
