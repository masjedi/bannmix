<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'category')) {
                $table->string('category')->nullable()->after('content');
            }

            if (!Schema::hasColumn('posts', 'brand')) {
                $table->string('brand')->nullable()->after('category');
            }

            if (!Schema::hasColumn('posts', 'sku')) {
                $table->string('sku')->nullable()->after('brand');
            }

            if (!Schema::hasColumn('posts', 'price')) {
                $table->decimal('price', 12, 2)->nullable()->after('sku');
            }

            if (!Schema::hasColumn('posts', 'currency')) {
                $table->string('currency', 10)->default('USD')->after('price');
            }

            if (!Schema::hasColumn('posts', 'moq')) {
                $table->integer('moq')->nullable()->after('currency');
            }

            if (!Schema::hasColumn('posts', 'unit')) {
                $table->string('unit')->nullable()->after('moq');
            }

            if (!Schema::hasColumn('posts', 'country_of_origin')) {
                $table->string('country_of_origin')->nullable()->after('unit');
            }

            if (!Schema::hasColumn('posts', 'hs_code')) {
                $table->string('hs_code')->nullable()->after('country_of_origin');
            }

            if (!Schema::hasColumn('posts', 'lead_time')) {
                $table->string('lead_time')->nullable()->after('hs_code');
            }

            if (!Schema::hasColumn('posts', 'payment_terms')) {
                $table->string('payment_terms')->nullable()->after('lead_time');
            }

            if (!Schema::hasColumn('posts', 'shipping_terms')) {
                $table->string('shipping_terms')->nullable()->after('payment_terms');
            }

            if (!Schema::hasColumn('posts', 'sample_available')) {
                $table->string('sample_available')->nullable()->after('shipping_terms');
            }

            if (!Schema::hasColumn('posts', 'certifications')) {
                $table->text('certifications')->nullable()->after('sample_available');
            }

            if (!Schema::hasColumn('posts', 'reject_reason')) {
                $table->text('reject_reason')->nullable()->after('status');
            }

            if (!Schema::hasColumn('posts', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->after('reject_reason')->constrained('users')->nullOnDelete();
            }

            if (!Schema::hasColumn('posts', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');

            $table->dropColumn([
                'category',
                'brand',
                'sku',
                'price',
                'currency',
                'moq',
                'unit',
                'country_of_origin',
                'hs_code',
                'lead_time',
                'payment_terms',
                'shipping_terms',
                'sample_available',
                'certifications',
                'reject_reason',
                'reviewed_at',
            ]);
        });
    }
};
