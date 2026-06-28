<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\UserService;
use App\Enums\UserStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_list_users_with_pagination(): void
    {
        User::factory()->count(15)->create();

        $result = app(UserService::class)->list(10);

        $this->assertCount(10, $result->items());
        $this->assertEquals(15, $result->total());
    }

    public function test_it_can_filter_users_by_status(): void
    {
        User::factory()->create(['status' => UserStatus::ACTIVE]);
        User::factory()->create(['status' => UserStatus::PASSIVE]);

        request()->merge(['filter' => ['status' => UserStatus::ACTIVE->value]]);

        $result = app(UserService::class)->list(10);

        $this->assertCount(1, $result->items());
        $this->assertEquals(UserStatus::ACTIVE, $result->items()[0]->status);
    }

    public function test_it_can_filter_users_by_gender(): void
    {
        User::factory()->create(['gender' => 'male']);
        User::factory()->create(['gender' => 'female']);

        request()->merge(['filter' => ['gender' => 'male']]);

        $result = app(UserService::class)->list(10);

        $this->assertCount(1, $result->items());
        $this->assertEquals('male', $result->items()[0]->gender);
    }

    public function test_it_can_search_users_by_name_surname_or_email(): void
    {
        User::factory()->create(['name' => 'Ahmet', 'surname' => 'Yilmaz', 'email' => 'ahmet@example.com']);
        User::factory()->create(['name' => 'Mehmet', 'surname' => 'Demir', 'email' => 'mehmet@example.com']);

        // Search by name
        request()->merge(['filter' => ['search' => 'Ahmet']]);
        $result = app(UserService::class)->list(10);
        $this->assertCount(1, $result->items());
        $this->assertEquals('Ahmet', $result->items()[0]->name);

        // Search by surname
        request()->merge(['filter' => ['search' => 'Demir']]);
        $result = app(UserService::class)->list(10);
        $this->assertCount(1, $result->items());
        $this->assertEquals('Mehmet', $result->items()[0]->name);
    }

    public function test_it_can_create_user(): void
    {
        $userData = [
            'name' => 'Veli',
            'surname' => 'Can',
            'email' => 'veli@example.com',
            'password' => 'secret123',
            'phone' => '12345678',
            'gender' => 'male',
            'status' => UserStatus::ACTIVE->value,
            'address' => 'Test Address',
        ];

        $user = app(UserService::class)->create($userData);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'veli@example.com',
        ]);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('secret123', $user->password));
    }

    public function test_it_can_update_user(): void
    {
        $user = User::factory()->create();

        $updateData = [
            'name' => 'YeniAd',
            'surname' => 'YeniSoyad',
            'email' => 'yeni@example.com',
            'status' => UserStatus::PASSIVE->value,
        ];

        app(UserService::class)->update($user, $updateData);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'YeniAd',
            'surname' => 'YeniSoyad',
            'status' => UserStatus::PASSIVE->value,
        ]);
    }

    public function test_it_can_delete_user(): void
    {
        $user = User::factory()->create();

        app(UserService::class)->delete($user);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }
}
