<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiteFeedbackRequest;
use App\Http\Resources\SiteFeedbackResource;
use App\Models\SiteFeedback;
use App\Services\AdminNotificationService;
use App\Services\PublicContentCache;
use Illuminate\Http\Request;

class PublicSiteFeedbackController extends Controller
{
    public function index(Request $request)
    {
        $limit = min(max((int) $request->integer('per_page', 12), 1), 24);

        $feedback = PublicContentCache::rememberApprovedFeedback(
            $limit,
            fn () => SiteFeedbackResource::collection(
                SiteFeedback::query()
                    ->approved()
                    ->latest()
                    ->limit($limit)
                    ->get()
            )->resolve()
        );

        return response()->json([
            'data' => $feedback,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    public function store(StoreSiteFeedbackRequest $request)
    {
        $feedback = SiteFeedback::create([
            'name' => trim($request->string('name')->toString()),
            'rating' => (int) $request->integer('rating'),
            'message' => trim($request->string('message')->toString()),
            'status' => SiteFeedback::STATUS_PENDING,
            'ip_address' => $request->ip(),
        ]);

        AdminNotificationService::notifySiteFeedback($feedback);

        return response()->json([
            'data' => new SiteFeedbackResource($feedback),
            'message' => 'Thank you. Your feedback was submitted as a draft and is awaiting approval.',
        ], 201);
    }
}
