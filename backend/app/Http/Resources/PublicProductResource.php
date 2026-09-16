<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'title' => $this->title,
            'content' => $this->content,

            'category' => $this->category,
            'brand' => $this->brand,
            'sku' => $this->sku,

            'price' => $this->price,
            'currency' => $this->currency,
            'moq' => $this->moq,
            'unit' => $this->unit,

            'country_of_origin' => $this->country_of_origin,
            'hs_code' => $this->hs_code,
            'lead_time' => $this->lead_time,
            'payment_terms' => $this->payment_terms,
            'shipping_terms' => $this->shipping_terms,
            'sample_available' => $this->sample_available,
            'certifications' => $this->certifications,

            'main_image_url' => $this->main_image_url,
            'gallery_image_urls' => $this->gallery_image_urls,

            'status' => $this->status,

            'published_at' => $this->reviewed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
