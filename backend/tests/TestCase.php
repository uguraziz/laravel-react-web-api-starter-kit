<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();

        if ($this->app) {
            // Eğer veritabanı tabloları yüklenmişse (RefreshDatabase vb. ile)
            if (Schema::hasTable('oauth_clients')) {
                $this->artisan('passport:keys');
                $this->artisan('passport:client', [
                    '--personal' => true,
                    '--name' => 'Personal Access Client',
                    '--provider' => 'users',
                    '--no-interaction' => true,
                ]);
            }

            if (Schema::hasTable('permissions')) {
                $permissions = [
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
    }

    /**
     * Spatie tabanlı yetkileri kullanıcıya güvenli ve guard uyumlu atar.
     */
    protected function givePermission(\App\Models\User $user, string ...$permissionNames): void
    {
        foreach ($permissionNames as $name) {
            $permission = Permission::findOrCreate($name, 'api');
            $user->givePermissionTo($permission);
        }
    }
}
