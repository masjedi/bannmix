<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminPasswordResetNotification extends Notification
{

    public function __construct(
        private readonly string $token,
        private readonly string $accountEmail,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $resetUrl = $frontendUrl.'/admin/reset-password?'.http_build_query([
            'token' => $this->token,
            'email' => $this->accountEmail,
        ]);

        $expireMinutes = (int) config('auth.passwords.users.expire', 60);

        return (new MailMessage)
            ->subject('Reset your BannMix admin password')
            ->greeting('Hello')
            ->line(
                'A password reset was requested for the BannMix admin dashboard.'
            )
            ->action('Reset password', $resetUrl)
            ->line("This link expires in {$expireMinutes} minutes.")
            ->line(
                'If you did not request a reset, you can ignore this email. Your password will stay the same.'
            );
    }
}
