<?php

namespace Tests\Unit\Services;

use App\Services\RoleService;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RoleServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_list_roles(): void
    {
        Role::create(['name' => 'admin', 'guard_name' => 'api']);
        Role::create(['name' => 'editor', 'guard_name' => 'api']);
        Role::create(['name' => 'web_user', 'guard_name' => 'web']);

        $roles = app(RoleService::class)->list();

        $this->assertCount(2, $roles);
        $this->assertEquals('admin', $roles[0]->name);
        $this->assertEquals('editor', $roles[1]->name);
    }

    public function test_it_can_create_role_without_permissions(): void
    {
        $data = ['name' => 'manager'];

        $role = app(RoleService::class)->create($data);

        $this->assertInstanceOf(Role::class, $role);
        $this->assertDatabaseHas('roles', [
            'name' => 'manager',
            'guard_name' => 'api',
        ]);
        $this->assertCount(0, $role->permissions);
    }

    public function test_it_can_create_role_with_permissions(): void
    {
        Permission::create(['name' => 'edit-posts', 'guard_name' => 'api']);
        Permission::create(['name' => 'delete-posts', 'guard_name' => 'api']);

        $data = [
            'name' => 'writer',
            'permissions' => ['edit-posts', 'delete-posts']
        ];

        $role = app(RoleService::class)->create($data);

        $this->assertInstanceOf(Role::class, $role);
        $this->assertDatabaseHas('roles', [
            'name' => 'writer',
            'guard_name' => 'api',
        ]);
        $this->assertCount(2, $role->permissions);
        $this->assertTrue($role->hasPermissionTo('edit-posts', 'api'));
    }

    public function test_it_can_update_role_details_and_sync_permissions(): void
    {
        $role = Role::create(['name' => 'old-name', 'guard_name' => 'api']);
        Permission::create(['name' => 'publish-posts', 'guard_name' => 'api']);
        Permission::create(['name' => 'archive-posts', 'guard_name' => 'api']);

        $role->givePermissionTo('publish-posts');

        $updateData = [
            'name' => 'new-name',
            'permissions' => ['archive-posts']
        ];

        $updatedRole = app(RoleService::class)->update($role, $updateData);

        $this->assertEquals('new-name', $updatedRole->name);
        $this->assertTrue($updatedRole->hasPermissionTo('archive-posts', 'api'));
        $this->assertFalse($updatedRole->hasPermissionTo('publish-posts', 'api'));
    }

    public function test_it_can_delete_role(): void
    {
        $role = Role::create(['name' => 'to-delete', 'guard_name' => 'api']);
        Permission::create(['name' => 'some-permission', 'guard_name' => 'api']);
        $role->givePermissionTo('some-permission');

        app(RoleService::class)->delete($role);

        $this->assertDatabaseMissing('roles', [
            'id' => $role->id,
        ]);
        $this->assertCount(0, DB::table('role_has_permissions')->where('role_id', $role->id)->get());
    }
}
