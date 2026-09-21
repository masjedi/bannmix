<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'posts_status_created_at_index');
            $table->index('category', 'posts_category_index');
            $table->index('brand', 'posts_brand_index');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_status_created_at_index');
            $table->dropIndex('posts_category_index');
            $table->dropIndex('posts_brand_index');
        });
    }
};
