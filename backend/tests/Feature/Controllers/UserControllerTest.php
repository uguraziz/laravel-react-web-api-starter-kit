<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Enums\UserStatus;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;



    public function test_authorized_user_can_list_users(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.show');

        User::factory()->count(5)->create();

        Passport::actingAs($user);

        $response = $this->getJson('/api/users?per_page=2');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'surname', 'email', 'status']
                ],
                'links',
                'meta'
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_unauthorized_user_cannot_list_users(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        Passport::actingAs($user);

        $response = $this->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_create_user_with_active_status(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.create');

        Passport::actingAs($user);

        $response = $this->postJson('/api/users', [
            'name' => 'John',
            'surname' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'status' => UserStatus::ACTIVE->value,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('email', 'john.doe@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'status' => UserStatus::ACTIVE->value,
        ]);
    }

    public function test_create_user_fails_if_status_is_passive_and_lacks_status_permission(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.create');

        Passport::actingAs($user);

        $response = $this->postJson('/api/users', [
            'name' => 'John',
            'surname' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'status' => UserStatus::PASSIVE->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_create_user_succeeds_if_status_is_passive_and_has_status_permission(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.create', 'user.user.status');

        Passport::actingAs($user);

        $response = $this->postJson('/api/users', [
            'name' => 'John',
            'surname' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'status' => UserStatus::PASSIVE->value,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'status' => UserStatus::PASSIVE->value,
        ]);
    }

    public function test_create_user_validation_errors(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.create');

        Passport::actingAs($user);

        $response = $this->postJson('/api/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'surname', 'email', 'password', 'status']);
    }

    public function test_unauthorized_user_cannot_create_user(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        Passport::actingAs($user);

        $response = $this->postJson('/api/users', [
            'name' => 'John',
            'surname' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'status' => UserStatus::ACTIVE->value,
        ]);

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_update_user_without_status_change(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.update');

        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->putJson("/api/users/{$targetUser->id}", [
            'name' => 'UpdatedName',
            'surname' => 'UpdatedSurname',
            'email' => 'updated@example.com',
            'status' => UserStatus::ACTIVE->value,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'UpdatedName',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_update_user_fails_if_status_changes_and_lacks_status_permission(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.update');

        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->putJson("/api/users/{$targetUser->id}", [
            'name' => 'UpdatedName',
            'surname' => 'UpdatedSurname',
            'email' => 'updated@example.com',
            'status' => UserStatus::PASSIVE->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_update_user_succeeds_if_status_changes_and_has_status_permission(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.update', 'user.user.status');

        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->putJson("/api/users/{$targetUser->id}", [
            'name' => 'UpdatedName',
            'surname' => 'UpdatedSurname',
            'email' => 'updated@example.com',
            'status' => UserStatus::PASSIVE->value,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'status' => UserStatus::PASSIVE->value,
        ]);
    }

    public function test_unauthorized_user_cannot_update_user(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->putJson("/api/users/{$targetUser->id}", [
            'name' => 'UpdatedName',
            'surname' => 'UpdatedSurname',
            'email' => 'updated@example.com',
            'status' => UserStatus::ACTIVE->value,
        ]);

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_delete_user(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.user.delete');

        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->deleteJson("/api/users/{$targetUser->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', [
            'id' => $targetUser->id,
        ]);
    }

    public function test_unauthorized_user_cannot_delete_user(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $targetUser = User::factory()->create(['status' => UserStatus::ACTIVE]);

        Passport::actingAs($user);

        $response = $this->deleteJson("/api/users/{$targetUser->id}");

        $response->assertStatus(403);
    }
}
