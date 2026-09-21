<?php

namespace App\Http\Controllers;

use App\Http\Resources\AdminNotificationResource;
use App\Models\AdminNotification;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'unread_only' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = AdminNotification::query()->latest();

        if (! empty($filters['unread_only'])) {
            $query->unread();
        }

        $notifications = $query->paginate($filters['per_page'] ?? 15);

        return AdminNotificationResource::collection($notifications);
    }

    public function unreadCount()
    {
        return response()->json([
            'count' => AdminNotification::query()->unread()->count(),
        ]);
    }

    public function markAsRead(AdminNotification $adminNotification)
    {
        if ($adminNotification->read_at === null) {
            $adminNotification->update(['read_at' => now()]);
        }

        return response()->json([
            'data' => new AdminNotificationResource($adminNotification->fresh()),
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllAsRead()
    {
        AdminNotification::query()
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }
}
