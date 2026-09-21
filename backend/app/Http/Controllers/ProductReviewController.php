<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductReviewResource;
use App\Models\Post;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductReviewController extends Controller
{
    public function index(Request $request, int $post)
    {
        Post::query()->findOrFail($post);

        $filters = $request->validate([
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    ProductReview::STATUS_PENDING,
                    ProductReview::STATUS_APPROVED,
                    ProductReview::STATUS_REJECTED,
                ]),
            ],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $reviews = ProductReview::query()
            ->where('post_id', $post)
            ->when(
                ! empty($filters['status']),
                fn ($query) => $query->where('status', $filters['status'])
            )
            ->latest()
            ->paginate($filters['per_page'] ?? 25);

        return ProductReviewResource::collection($reviews);
    }

    public function updateStatus(Request $request, ProductReview $productReview)
    {
        $data = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    ProductReview::STATUS_PENDING,
                    ProductReview::STATUS_APPROVED,
                    ProductReview::STATUS_REJECTED,
                ]),
            ],
        ]);

        $productReview->update([
            'status' => $data['status'],
        ]);

        return response()->json([
            'data' => new ProductReviewResource($productReview->fresh()),
            'message' => 'Review status updated.',
        ]);
    }

    public function destroy(ProductReview $productReview)
    {
        $productReview->delete();

        return response()->json([
            'message' => 'Review deleted.',
        ]);
    }
}
