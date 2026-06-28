<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Enums\UserStatus;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
{
    use RefreshDatabase;



    public function test_authorized_user_can_list_permissions(): void
    {
        $user = User::factory()->create([
            'status' => UserStatus::ACTIVE,
        ]);
        $this->givePermission($user, 'user.permission.show');

        // Ekstra bir izin daha oluşturalım ki listelendiğini görelim
        Permission::findOrCreate('some.other.permission', 'api');

        Passport::actingAs($user);

        $response = $this->getJson('/api/permissions');

        $expectedCount = Permission::where('guard_name', 'api')->count();

        $response->assertStatus(200)
            ->assertJsonCount($expectedCount, 'data')
            ->assertJsonFragment([
                'name' => 'user.permission.show'
            ])
            ->assertJsonFragment([
                'name' => 'some.other.permission'
            ]);
    }

    public function test_unauthorized_user_cannot_list_permissions(): void
    {
        // Yetki kontrolünün hata vermemesi için iznin veritabanında olması gerekir
        Permission::findOrCreate('user.permission.show', 'api');

        $user = User::factory()->create([
            'status' => UserStatus::ACTIVE,
        ]);

        Passport::actingAs($user);

        $response = $this->getJson('/api/permissions');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_permissions(): void
    {
        $response = $this->getJson('/api/permissions');

        $response->assertStatus(401);
    }
}
