<?php

namespace App\Services;

use App\Models\User;
use App\Enums\UserStatus;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Authenticate a user and return the user and access token.
     *
     * @param array{email: string, password: string} $credentials
     * @return array{user: User, token: string}
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->status !== UserStatus::ACTIVE) {
            throw ValidationException::withMessages([
                'email' => ['Hesabınız aktif durumda değil.'],
            ]);
        }

        $token = $user->createToken('Personal Access Token')->accessToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Log the user out by revoking their token.
     *
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        $user->token()->revoke();
    }
}
