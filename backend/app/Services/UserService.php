<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UserService
{
    public function list(int $perPage = 10): LengthAwarePaginator
    {
        return QueryBuilder::for(User::class)
            ->with('roles')
            ->allowedFilters(
                AllowedFilter::exact('status'),
                AllowedFilter::exact('gender'),
                AllowedFilter::callback('role', function ($query, $value) {
                    $query->whereHas('roles', function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                          ->orWhere('surname', 'like', "%{$value}%")
                          ->orWhere('email', 'like', "%{$value}%")
                          ->orWhere('phone', 'like', "%{$value}%");
                    });
                })
            )
            ->allowedSorts('name', 'created_at')
            ->defaultSort('-created_at')
            ->paginate($perPage);
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $user = User::create($data);
        if (!empty($roles)) {
            $user->syncRoles($roles);
        }
        return $user->load('roles');
    }

    public function update(User $user, array $data): User
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $roles = $data['roles'] ?? null;
        unset($data['roles']);

        $user->update($data);
        if ($roles !== null) {
            $user->syncRoles($roles);
        }
        return $user->load('roles');
    }

    public function delete(User $user): void
    {
        $user->delete();
    }
}
