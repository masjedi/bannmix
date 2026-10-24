<?php

namespace App\Support;

use RuntimeException;

class AdminMail
{
    public static function isConfigured(): bool
    {
        try {
            self::assertConfigured();

            return true;
        } catch (RuntimeException) {
            return false;
        }
    }

    public static function assertConfigured(): void
    {
        $mailer = (string) config('mail.default', 'log');

        if ($mailer === 'log') {
            throw new RuntimeException(
                'MAIL_MAILER is set to "log". Emails are written to storage/logs only. Set MAIL_MAILER=smtp and Gmail credentials in .env.'
            );
        }

        if ($mailer !== 'smtp') {
            return;
        }

        $username = (string) config('mail.mailers.smtp.username', '');
        $password = (string) config('mail.mailers.smtp.password', '');

        if ($username === '' || $password === '') {
            throw new RuntimeException(
                'Gmail SMTP is not configured. Set MAIL_USERNAME and MAIL_PASSWORD (Google App Password) in backend/.env.'
            );
        }
    }
}
