<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    use HasFactory;

    public const TYPE_CONTACT_MESSAGE = 'contact_message';

    public const TYPE_PRODUCT_REVIEW = 'product_review';

    public const TYPE_SITE_FEEDBACK = 'site_feedback';

    protected $fillable = [
        'type',
        'title',
        'body',
        'action_url',
        'related_type',
        'related_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
