<?php

namespace App\Http\Requests;

use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermissionTo('user.user.create', 'api') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'status' => [
                'required', 
                new Enum(UserStatus::class),
                function ($attribute, $value, $fail) {
                    if ($value !== 'active' && !$this->user()?->hasPermissionTo('user.user.status', 'api')) {
                        $fail('Durum (status) alanını aktif dışı seçmek için yetkiniz bulunmamaktadır.');
                    }
                }
            ],
            'address' => ['nullable', 'string'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];
    }
}
