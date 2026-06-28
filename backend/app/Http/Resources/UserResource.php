<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'surname' => $this->surname,
            'email' => $this->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'status' => $this->status?->value ?? $this->status,
            'address' => $this->address,
            'roles' => $this->relationLoaded('roles') 
                ? $this->roles->pluck('name')->toArray() 
                : $this->roles()->pluck('name')->toArray(),
            'permissions' => $this->getAllPermissions()->pluck('name')->toArray(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
