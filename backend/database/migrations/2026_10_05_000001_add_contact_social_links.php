<?php

use App\Services\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $links = [
            'facebook' => ['Facebook', 'https://www.facebook.com/BannMix'],
            'linkedin' => ['LinkedIn', 'https://www.linkedin.com/BannMix'],
            'instagram' => ['Instagram', 'https://www.instagram.com/BannMix'],
            'twitter' => ['X / Twitter', 'https://www.twitter.com/BannMix'],
            'tiktok' => ['TikTok', 'https://www.tiktok.com/BannMix'],
            'youtube' => ['YouTube', 'https://www.youtube.com/BannMix'],
        ];

        // Preserve any social links already configured by an administrator.
        if (DB::table('site_contents')->where('page', 'contact')->where('section', 'social_links')->exists()) {
            return;
        }

        foreach (array_keys($links) as $order => $key) {
            [$label, $url] = $links[$key];
            DB::table('site_contents')->insert([
                'page' => 'contact', 'section' => 'social_links', 'content_key' => $key,
                'title' => json_encode(['en' => $label, 'ps' => $label, 'fa' => $label]),
                'button_url' => $url, 'sort_order' => $order, 'is_active' => true,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        PublicContentCache::forgetPage('contact');
    }

    public function down(): void
    {
        // Retain administrator-owned content when rolling back this data migration.
    }
};
