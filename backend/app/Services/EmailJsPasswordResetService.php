<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class EmailJsPasswordResetService
{
    public function send(User $user, string $token): void
    {
        $this->ensureConfigured();

        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $resetUrl = $frontendUrl.'/?'.http_build_query([
            'token' => $token,
            'email' => $user->getEmailForPasswordReset(),
        ]);

        $response = Http::asJson()
            ->acceptJson()
            ->timeout((int) config('emailjs.timeout'))
            ->retry(
                2,
                1100,
                fn ($exception) => $exception instanceof RequestException
                    && $exception->response->status() === 429,
                throw: false,
            )
            ->post((string) config('emailjs.endpoint'), [
                'service_id' => config('emailjs.service_id'),
                'template_id' => config('emailjs.template_id'),
                'user_id' => config('emailjs.public_key'),
                'accessToken' => config('emailjs.private_key'),
                'template_params' => [
                    'to_email' => $user->getEmailForPasswordReset(),
                    'to_name' => $user->fullname ?: 'User',
                    'reset_url' => $resetUrl,
                    'expires_in_minutes' => (int) config('auth.passwords.users.expire'),
                    'app_name' => config('app.name'),
                ],
            ]);

        if (!$response->successful()) {
            $responseSummary = preg_replace('/[\r\n]+/', ' ', strip_tags($response->body()));
            $responseSummary = mb_substr(trim((string) $responseSummary), 0, 500);

            throw new RuntimeException(
                'EmailJS rejected the password reset email with status '.$response->status()
                .($responseSummary !== '' ? ': '.$responseSummary : '.')
            );
        }
    }

    private function ensureConfigured(): void
    {
        $required = [
            'service ID' => config('emailjs.service_id'),
            'password reset template ID' => config('emailjs.template_id'),
            'public key' => config('emailjs.public_key'),
            'private key' => config('emailjs.private_key'),
        ];

        $missing = array_keys(array_filter(
            $required,
            fn ($value) => blank($value) || str_starts_with((string) $value, 'your_emailjs_'),
        ));

        if ($missing !== []) {
            throw new RuntimeException('EmailJS is missing: '.implode(', ', $missing).'.');
        }
    }
}
