<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class HomeSiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            [
                'page' => 'home',
                'section' => 'hero',
                'content_key' => 'main_hero',
                'title' => [
                    'en' => 'Natural products for strength and clarity',
                    'ps' => 'د ځواک او روښانتیا لپاره طبیعي محصولات',
                    'fa' => 'محصولات طبیعی برای قدرت و وضوح ذهن',
                ],
                'subtitle' => [
                    'en' => 'BanMix',
                    'ps' => 'BanMix',
                    'fa' => 'BanMix',
                ],
                'content' => [
                    'en' => 'BanMix produces natural health products from nuts and dry fruits. Based in Kabul, Afghanistan, we focus on quality, transparency, and trusted formulations.',
                    'ps' => 'BanMix د مغز لرونکو او وچو مېوو څخه طبیعي روغتیايي محصولات تولیدوي. په کابل کې میشت، موږ په کیفیت، شفافیت او باوري فورمولونو تمرکز کوو.',
                    'fa' => 'BanMix محصولات طبیعی سلامت را از مغزها و میوه‌های خشک تولید می‌کند. مستقر در کابل، ما بر کیفیت، شفافیت و فرمولاسیون‌های قابل اعتماد تمرکز داریم.',
                ],
                'button_text' => [
                    'en' => 'Explore Products',
                    'ps' => 'محصولات وګورئ',
                    'fa' => 'مشاهده محصولات',
                ],
                'button_url' => '/products',
                'sort_order' => 0,
                'is_active' => true,
            ],

            [
                'page' => 'home',
                'section' => 'modules_header',
                'content_key' => 'modules_title',
                'title' => [
                    'en' => 'What we offer',
                    'ps' => 'هغه څه چې وړاندې کوو',
                    'fa' => 'آنچه ارائه می‌دهیم',
                ],
                'sort_order' => 0,
                'is_active' => true,
            ],

            [
                'page' => 'home',
                'section' => 'modules',
                'content_key' => 'products',
                'title' => [
                    'en' => 'Products',
                    'ps' => 'محصولات',
                    'fa' => 'محصولات',
                ],
                'content' => [
                    'en' => 'Browse our catalog of natural formulations crafted for everyday wellness.',
                    'ps' => 'زموږ د طبیعي فورمولونو کتلاګ وګورئ چې د ورځني روغتیا لپاره جوړ شوي.',
                    'fa' => 'کاتالوگ فرمولاسیون‌های طبیعی ما را برای سلامت روزمره مرور کنید.',
                ],
                'button_url' => '/products',
                'sort_order' => 0,
                'is_active' => true,
            ],

            [
                'page' => 'home',
                'section' => 'modules',
                'content_key' => 'services',
                'title' => [
                    'en' => 'Services',
                    'ps' => 'خدمات',
                    'fa' => 'خدمات',
                ],
                'content' => [
                    'en' => 'Learn how BanMix supports partners with formulation, quality, and delivery.',
                    'ps' => 'زده کړئ چې BanMix څنګه د فورمول، کیفیت او رسولو له لارې شریکانو ملاتړ کوي.',
                    'fa' => 'ببینید BanMix چگونه با فرمولاسیون، کیفیت و تحویل از شرکا پشتیبانی می‌کند.',
                ],
                'button_url' => '/services',
                'sort_order' => 1,
                'is_active' => true,
            ],

            [
                'page' => 'home',
                'section' => 'modules',
                'content_key' => 'events',
                'title' => [
                    'en' => 'Events',
                    'ps' => 'پیښې',
                    'fa' => 'رویدادها',
                ],
                'content' => [
                    'en' => 'Stay updated on BanMix events, exhibitions, and community activities.',
                    'ps' => 'د BanMix پیښو، نندارتونونو او ټولنیزو فعالیتونو په اړه خبر اوسئ.',
                    'fa' => 'از رویدادها، نمایشگاه‌ها و فعالیت‌های اجتماعی BanMix باخبر بمانید.',
                ],
                'button_url' => '/events',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($contents as $content) {
            SiteContent::query()->updateOrCreate(
                [
                    'page' => $content['page'],
                    'section' => $content['section'],
                    'content_key' => $content['content_key'],
                ],
                $content
            );
        }
    }
}
