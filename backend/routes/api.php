<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\PublicContactMessageController;
use App\Http\Controllers\PublicSiteFeedbackController;
use App\Http\Controllers\SiteFeedbackController;
use App\Http\Controllers\PublicProductController;
use App\Http\Controllers\PublicProductReviewController;
use App\Http\Controllers\SiteContentController;

/*
|--------------------------------------------------------------------------
| Public Authentication
|--------------------------------------------------------------------------
*/

Route::post('login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Public Website Routes
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {
    Route::get('products', [PublicProductController::class, 'index']);
    Route::get('products/{id}', [PublicProductController::class, 'show'])->whereNumber('id');
    Route::get('products/{id}/reviews', [PublicProductReviewController::class, 'index'])->whereNumber('id');
    Route::post('products/{id}/reviews', [PublicProductReviewController::class, 'store'])->whereNumber('id');
    Route::post('contact-messages', [PublicContactMessageController::class, 'store']);
    Route::post('feedback', [PublicSiteFeedbackController::class, 'store']);
    Route::get('feedback', [PublicSiteFeedbackController::class, 'index']);
    Route::get('content/{page}', [SiteContentController::class, 'publicPage']);
});

/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('posts', PostController::class);

    Route::get('posts/{post}/reviews', [ProductReviewController::class, 'index'])->whereNumber('post');
    Route::patch('product-reviews/{productReview}/status', [ProductReviewController::class, 'updateStatus']);
    Route::delete('product-reviews/{productReview}', [ProductReviewController::class, 'destroy']);

    Route::get('admin/notifications', [AdminNotificationController::class, 'index']);
    Route::get('admin/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
    Route::patch('admin/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    Route::patch('admin/notifications/{adminNotification}/read', [AdminNotificationController::class, 'markAsRead']);

    Route::get('admin/contact-messages', [ContactMessageController::class, 'index']);
    Route::patch('admin/contact-messages/{contactMessage}/read', [ContactMessageController::class, 'markAsRead']);

    Route::get('admin/feedback', [SiteFeedbackController::class, 'index']);
    Route::patch('admin/feedback/{siteFeedback}/status', [SiteFeedbackController::class, 'updateStatus']);
    Route::delete('admin/feedback/{siteFeedback}', [SiteFeedbackController::class, 'destroy']);

    Route::prefix('admin/site-contents')->group(function () {
        Route::get('/', [SiteContentController::class, 'index']);
        Route::post('/', [SiteContentController::class, 'store']);
        Route::patch('/reorder', [SiteContentController::class, 'reorder']);
        Route::get('/{siteContent}', [SiteContentController::class, 'show'])->whereNumber('siteContent');
        Route::put('/{siteContent}', [SiteContentController::class, 'update'])->whereNumber('siteContent');
        Route::patch('/{siteContent}', [SiteContentController::class, 'update'])->whereNumber('siteContent');
        Route::patch('/{siteContent}/status', [SiteContentController::class, 'updateStatus'])->whereNumber('siteContent');
        Route::delete('/{siteContent}', [SiteContentController::class, 'destroy'])->whereNumber('siteContent');
    });
});
