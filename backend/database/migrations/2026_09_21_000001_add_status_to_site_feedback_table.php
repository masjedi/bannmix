<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_feedback', function (Blueprint $table) {
            if (! Schema::hasColumn('site_feedback', 'status')) {
                $table->string('status', 20)->default('pending')->after('message');
                $table->index('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_feedback', function (Blueprint $table) {
            if (Schema::hasColumn('site_feedback', 'status')) {
                $table->dropIndex(['status']);
                $table->dropColumn('status');
            }
        });
    }
};
