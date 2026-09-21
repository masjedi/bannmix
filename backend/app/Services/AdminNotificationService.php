<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\ContactMessage;
use App\Models\ProductReview;
use App\Models\SiteFeedback;

class AdminNotificationService
{
    public static function notifyContactMessage(ContactMessage $message): AdminNotification
    {
        $subject = trim((string) $message->subject);

        return AdminNotification::create([
            'type' => AdminNotification::TYPE_CONTACT_MESSAGE,
            'title' => 'New contact message',
            'body' => sprintf(
                '%s — %s',
                $message->name,
                $subject !== '' ? $subject : 'General inquiry'
            ),
            'action_url' => '/admin/contact-messages',
            'related_type' => ContactMessage::class,
            'related_id' => $message->id,
        ]);
    }

    public static function notifySiteFeedback(SiteFeedback $feedback): AdminNotification
    {
        return AdminNotification::create([
            'type' => AdminNotification::TYPE_SITE_FEEDBACK,
            'title' => 'New feedback draft',
            'body' => sprintf(
                '%s left a %d-star rating (awaiting approval): %s',
                $feedback->name,
                $feedback->rating,
                $feedback->message
            ),
            'action_url' => '/admin/feedback',
            'related_type' => SiteFeedback::class,
            'related_id' => $feedback->id,
        ]);
    }

    public static function notifyProductReview(ProductReview $review): AdminNotification
    {
        $review->loadMissing('post');
        $productTitle = $review->post?->title ?? 'a product';
        $postId = $review->post?->id;

        return AdminNotification::create([
            'type' => AdminNotification::TYPE_PRODUCT_REVIEW,
            'title' => 'New product review',
            'body' => sprintf(
                '%s left a %d-star review on %s',
                $review->reviewer_name,
                $review->rating,
                $productTitle
            ),
            'action_url' => $postId
                ? "/admin/posts/{$postId}?tab=customer_reviews"
                : '/admin/posts',
            'related_type' => ProductReview::class,
            'related_id' => $review->id,
        ]);
    }
}
