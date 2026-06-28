<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('user.permission.update', 'api') ?? false;
    }

    public function rules(): array
    {
        $roleId = $this->route('role')->id ?? null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                "unique:roles,name,{$roleId},id,guard_name,api",
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
