<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'main_image')) {
                $table->string('main_image')->nullable()->after('certifications');
            }

            if (!Schema::hasColumn('posts', 'gallery_images')) {
                $table->json('gallery_images')->nullable()->after('main_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'gallery_images')) {
                $table->dropColumn('gallery_images');
            }

            if (Schema::hasColumn('posts', 'main_image')) {
                $table->dropColumn('main_image');
            }
        });
    }
};
