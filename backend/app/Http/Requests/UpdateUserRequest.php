<?php

namespace App\Http\Requests;

use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('user.user.update', 'api') ?? false;
    }

    public function rules(): array
    {
        $userModel = $this->route('user');
        $currentStatus = $userModel instanceof \App\Models\User 
            ? $userModel->status->value 
            : null;

        $userId = $userModel instanceof \App\Models\User 
            ? $userModel->id 
            : $userModel;

        return [
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'status' => [
                'required', 
                new Enum(UserStatus::class),
                function ($attribute, $value, $fail) use ($currentStatus) {
                    if ($currentStatus && $value !== $currentStatus && !$this->user()?->hasPermissionTo('user.user.status', 'api')) {
                        $fail('Durum (status) alanını değiştirmek için yetkiniz bulunmamaktadır.');
                    }
                }
            ],
            'address' => ['nullable', 'string'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];
    }
}
