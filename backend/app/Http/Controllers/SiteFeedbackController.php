<?php

namespace App\Http\Controllers;

use App\Http\Resources\SiteFeedbackResource;
use App\Models\SiteFeedback;
use App\Services\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SiteFeedbackController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    SiteFeedback::STATUS_PENDING,
                    SiteFeedback::STATUS_APPROVED,
                    SiteFeedback::STATUS_REJECTED,
                ]),
            ],
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $feedback = SiteFeedback::query()
            ->when(
                ! empty($filters['status']),
                fn ($query) => $query->where('status', $filters['status'])
            )
            ->when(
                ! empty($filters['search']),
                function ($query) use ($filters) {
                    $search = trim($filters['search']);

                    $query->where(function ($builder) use ($search) {
                        $builder
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('message', 'like', "%{$search}%");
                    });
                }
            )
            ->latest()
            ->paginate($filters['per_page'] ?? 25);

        return SiteFeedbackResource::collection($feedback);
    }

    public function updateStatus(Request $request, SiteFeedback $siteFeedback)
    {
        $data = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    SiteFeedback::STATUS_PENDING,
                    SiteFeedback::STATUS_APPROVED,
                    SiteFeedback::STATUS_REJECTED,
                ]),
            ],
        ]);

        $siteFeedback->update([
            'status' => $data['status'],
            'read_at' => $siteFeedback->read_at ?? now(),
        ]);

        PublicContentCache::forgetApprovedFeedback();

        return response()->json([
            'data' => new SiteFeedbackResource($siteFeedback->fresh()),
            'message' => 'Feedback status updated.',
        ]);
    }

    public function destroy(SiteFeedback $siteFeedback)
    {
        $siteFeedback->delete();

        PublicContentCache::forgetApprovedFeedback();

        return response()->json([
            'message' => 'Feedback deleted.',
        ]);
    }
}
