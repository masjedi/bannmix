<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'body' => $this->body,
            'action_url' => $this->action_url,
            'related_type' => $this->related_type,
            'related_id' => $this->related_id,
            'read_at' => $this->read_at?->toISOString(),
            'is_read' => $this->read_at !== null,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
