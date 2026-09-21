<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Services\AdminNotificationService;

class PublicContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request)
    {
        $message = ContactMessage::create([
            'name' => trim($request->string('name')->toString()),
            'email' => trim($request->string('email')->toString()),
            'subject' => $request->filled('subject')
                ? trim($request->string('subject')->toString())
                : null,
            'message' => trim($request->string('message')->toString()),
            'ip_address' => $request->ip(),
        ]);

        AdminNotificationService::notifyContactMessage($message);

        return response()->json([
            'data' => new ContactMessageResource($message),
            'message' => 'Thank you. Your message has been sent to our team.',
        ], 201);
    }
}
