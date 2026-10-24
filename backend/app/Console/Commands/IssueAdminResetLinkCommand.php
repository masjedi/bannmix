<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Password;

class IssueAdminResetLinkCommand extends Command
{
    protected $signature = 'admin:issue-reset-link';

    protected $description = 'Print a one-time admin password reset URL (local/dev when email is not configured)';

    public function handle(): int
    {
        $admin = User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $admin) {
            $this->error('No active admin user found.');

            return self::FAILURE;
        }

        $token = Password::broker('users')->createToken($admin);
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $url = $frontendUrl.'/admin/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $admin->email,
        ]);

        $this->line('Admin login email: '.$admin->email);
        $this->line('Open this URL once in your browser:');
        $this->newLine();
        $this->info($url);

        return self::SUCCESS;
    }
}
