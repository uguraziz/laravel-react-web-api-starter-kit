<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class UserPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.show',
            'user.user.show',
            'user.user.create',
            'user.user.update',
            'user.user.delete',
            'user.user.status',
            'user.permission.show',
            'user.permission.create',
            'user.permission.update',
            'user.permission.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'api');
        }
    }
}
