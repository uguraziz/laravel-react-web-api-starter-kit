<?php

namespace Database\Seeders;

use App\Models\User;
use App\Enums\UserStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin',
            'surname' => 'User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('qweqwe'),
            'phone' => '+905555555555',
            'gender' => 'male',
            'status' => UserStatus::ACTIVE,
            'address' => 'Izmir, Turkey',
        ]);
        
        $adminRole = \Spatie\Permission\Models\Role::findOrCreate('admin', 'api');
        $adminRole->syncPermissions(\Spatie\Permission\Models\Permission::all());
        $user->assignRole($adminRole);
        
        User::factory(10)->create();
    }
}
