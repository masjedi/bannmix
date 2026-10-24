<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AdminMail;
use Illuminate\Auth\Events\PasswordReset;
use RuntimeException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetController extends Controller
{
    /**
     * Send a reset link for the sole admin account (generic response).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $admin = User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $admin) {
            return response()->json([
                'message' => $this->genericForgotMessage(),
            ]);
        }

        if (! AdminMail::isConfigured()) {
            Log::warning(
                'Admin password reset requested but mail is not configured.',
                ['admin_email' => $admin->email]
            );

            return response()->json([
                'message' =>
                    'No email was sent because mail is not configured on the server.',
                'email_sent' => false,
                'mail_configured' => false,
            ]);
        }

        try {
            $status = Password::broker('users')->sendResetLink([
                'email' => $admin->email,
            ]);

            if ($status === Password::RESET_THROTTLED) {
                $waitSeconds = (int) config('auth.passwords.users.throttle', 60);

                return response()->json([
                    'message' =>
                        "Please wait {$waitSeconds} seconds before requesting another reset link.",
                    'email_sent' => false,
                    'mail_configured' => true,
                    'retry_after_seconds' => $waitSeconds,
                ]);
            }

            if ($status !== Password::RESET_LINK_SENT) {
                Log::warning('Admin password reset link not sent.', [
                    'status' => $status,
                    'admin_email' => $admin->email,
                ]);

                return response()->json([
                    'message' => 'We could not send the reset email.',
                    'email_sent' => false,
                    'mail_configured' => true,
                    'mail_error' => config('app.debug') ? __($status) : null,
                ]);
            }
        } catch (Throwable $exception) {
            Log::error('Admin password reset mail failed.', [
                'admin_email' => $admin->email,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'We could not send the reset email.',
                'email_sent' => false,
                'mail_configured' => true,
                'mail_error' => config('app.debug')
                    ? $exception->getMessage()
                    : null,
            ]);
        }

        return response()->json([
            'message' => $this->genericForgotMessage(),
            'email_sent' => true,
            'mail_configured' => true,
        ]);
    }

    private function genericForgotMessage(): string
    {
        return 'If an admin account exists, a reset link has been sent to the registered recovery inbox.';
    }

    /**
     * Reset the admin password using the emailed token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(12)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $status = Password::broker('users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                if ($user->role !== 'admin' || ! $user->is_active) {
                    throw ValidationException::withMessages([
                        'email' => ['This reset link is not valid for this account.'],
                    ]);
                }

                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Your password has been reset. You can sign in with the new password.',
        ]);
    }
}
