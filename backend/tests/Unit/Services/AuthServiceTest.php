<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Enums\UserStatus;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        $result = app(AuthService::class)->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals($user->id, $result['user']->id);
        $this->assertNotEmpty($result['token']);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        $this->expectException(ValidationException::class);

        app(AuthService::class)->login([
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);
    }

    public function test_user_cannot_login_if_status_is_not_active(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::PASSIVE,
        ]);

        $this->expectException(ValidationException::class);

        app(AuthService::class)->login([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'status' => UserStatus::ACTIVE,
        ]);

        $tokenResult = $user->createToken('Personal Access Token');
        $accessToken = new \Laravel\Passport\AccessToken([
            'oauth_access_token_id' => $tokenResult->token->id,
        ]);
        $user->withAccessToken($accessToken);

        $this->assertNotNull($user->token());

        app(AuthService::class)->logout($user);

        $this->assertTrue($user->tokens()->first()->revoked);
    }
}
