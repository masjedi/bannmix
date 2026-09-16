<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PublicProductController;
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
