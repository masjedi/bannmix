<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AdminPostListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status,
            'category' => $this->category,
            'price' => $this->price,
            'currency' => $this->currency,
            'main_image_url' => $this->main_image_url,
            'created_at' => $this->created_at?->toIso8601String(),
            'excerpt' => $this->buildExcerpt(),
        ];
    }

    private function buildExcerpt(): string
    {
        $source = (string) ($this->content_excerpt ?? $this->content ?? '');

        if ($source === '') {
            return '';
        }

        $plainText = trim(
            strip_tags(html_entity_decode($source, ENT_QUOTES | ENT_HTML5, 'UTF-8'))
        );

        return Str::limit($plainText, 120, '…');
    }
}
