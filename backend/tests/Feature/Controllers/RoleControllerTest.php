<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Enums\UserStatus;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;



    public function test_authorized_user_can_list_roles(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.show');

        Role::create(['name' => 'test-role-1', 'guard_name' => 'api']);
        Role::create(['name' => 'test-role-2', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'userCount', 'permissions']
                ]
            ]);
    }

    public function test_unauthorized_user_cannot_list_roles(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        Passport::actingAs($user);

        $response = $this->getJson('/api/roles');

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_get_role_details(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.show');

        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->getJson("/api/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $role->id,
                    'name' => 'test-role',
                ]
            ]);
    }

    public function test_unauthorized_user_cannot_get_role_details(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->getJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_create_role(): void
    {
        Permission::findOrCreate('dummy-permission', 'api');
        
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.create');

        Passport::actingAs($user);

        $response = $this->postJson('/api/roles', [
            'name' => 'new-role',
            'permissions' => ['dummy-permission']
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'new-role');

        $this->assertDatabaseHas('roles', [
            'name' => 'new-role',
            'guard_name' => 'api',
        ]);
    }

    public function test_unauthorized_user_cannot_create_role(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        Passport::actingAs($user);

        $response = $this->postJson('/api/roles', [
            'name' => 'new-role',
        ]);

        $response->assertStatus(403);
    }

    public function test_create_role_validation_errors(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.create');

        Role::create(['name' => 'existing-role', 'guard_name' => 'api']);

        Passport::actingAs($user);

        // Boş isim gönderimi
        $response = $this->postJson('/api/roles', [
            'name' => '',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['name']);

        // Zaten var olan isim gönderimi
        $response = $this->postJson('/api/roles', [
            'name' => 'existing-role',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['name']);

        // Olmayan yetki gönderimi
        $response = $this->postJson('/api/roles', [
            'name' => 'another-role',
            'permissions' => ['non-existent-permission']
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['permissions.0']);
    }

    public function test_authorized_user_can_update_role(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.update');

        $role = Role::create(['name' => 'old-role-name', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->putJson("/api/roles/{$role->id}", [
            'name' => 'new-role-name',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('name', 'new-role-name');

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'new-role-name',
        ]);
    }

    public function test_unauthorized_user_cannot_update_role(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $role = Role::create(['name' => 'test-role', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->putJson("/api/roles/{$role->id}", [
            'name' => 'new-role-name',
        ]);

        $response->assertStatus(403);
    }

    public function test_update_role_validation_errors(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.update');

        $roleToUpdate = Role::create(['name' => 'role-1', 'guard_name' => 'api']);
        Role::create(['name' => 'role-2', 'guard_name' => 'api']);

        Passport::actingAs($user);

        // İsmin role-2 ile çakışması (çünkü unique olmalı)
        $response = $this->putJson("/api/roles/{$roleToUpdate->id}", [
            'name' => 'role-2',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['name']);

        // Kendi ismini gönderebilmeli (çakışma olmamalı)
        $response = $this->putJson("/api/roles/{$roleToUpdate->id}", [
            'name' => 'role-1',
        ]);
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_delete_role(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $this->givePermission($user, 'user.permission.delete');

        $role = Role::create(['name' => 'role-to-delete', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
    }

    public function test_unauthorized_user_cannot_delete_role(): void
    {
        $user = User::factory()->create(['status' => UserStatus::ACTIVE]);
        $role = Role::create(['name' => 'role-to-delete', 'guard_name' => 'api']);

        Passport::actingAs($user);

        $response = $this->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
    }
}
