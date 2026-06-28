<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use App\Http\Resources\UserResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'userCount' => $this->users_count ?? $this->users()->count(),
            'permissions' => $this->relationLoaded('permissions') 
                ? $this->permissions->pluck('name')->toArray() 
                : $this->permissions()->pluck('name')->toArray(),
            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}
