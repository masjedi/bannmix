<?php

namespace App\Http\Controllers;

use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $messages = ContactMessage::query()
            ->latest()
            ->paginate(min((int) $request->integer('per_page', 25), 100));

        return ContactMessageResource::collection($messages);
    }

    public function markAsRead(ContactMessage $contactMessage)
    {
        if ($contactMessage->read_at === null) {
            $contactMessage->update(['read_at' => now()]);
        }

        return response()->json([
            'data' => new ContactMessageResource($contactMessage->fresh()),
            'message' => 'Message marked as read.',
        ]);
    }
}
