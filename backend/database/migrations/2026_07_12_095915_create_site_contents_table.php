<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();

            /*
             * Website page identifier.
             *
             * Examples:
             * home
             * about
             * quality
             * research
             * news
             * contact
             * faq
             */
            $table->string('page', 100);

            /*
             * Section identifier inside a page.
             *
             * Examples:
             * introduction
             * product_highlights
             * banners
             * testimonials
             * company_history
             * vision
             * mission
             */
            $table->string('section', 100);

            /*
             * Optional unique key for a specific content item.
             *
             * Examples:
             * main_banner
             * company_vision
             * order_now
             * factory_gallery_1
             */
            $table->string('content_key', 150)->nullable();

            /*
             * Multilingual JSON structure:
             *
             * {
             *     "en": "About BanMix",
             *     "ps": "د بڼمیکس په اړه",
             *     "fa": "درباره بڼمیکس"
             * }
             */
            $table->json('title')->nullable();
            $table->json('subtitle')->nullable();
            $table->json('content')->nullable();
            $table->json('button_text')->nullable();

            /*
             * Button URL is normally language-independent.
             *
             * Examples:
             * /products
             * /contact
             * /store
             */
            $table->string('button_url', 500)->nullable();

            /*
             * Uploaded media paths or external media URLs.
             */
            $table->string('image_path', 500)->nullable();
            $table->string('video_url', 1000)->nullable();

            /*
             * Optional additional settings.
             *
             * Examples:
             * {
             *     "open_in_new_tab": true,
             *     "background_position": "center",
             *     "layout": "image_left"
             * }
             */
            $table->json('metadata')->nullable();

            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('page');
            $table->index('section');
            $table->index('is_active');
            $table->index(['page', 'section']);
            $table->index([
                'page',
                'section',
                'is_active',
                'sort_order',
            ]);

            /*
             * Prevent duplicate named content blocks while still allowing
             * multiple unnamed repeatable items such as banners or gallery
             * images.
             */
            $table->unique(
                ['page', 'section', 'content_key'],
                'site_contents_page_section_key_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
