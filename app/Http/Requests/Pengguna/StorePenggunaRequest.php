<?php

namespace App\Http\Requests\Pengguna;

use Illuminate\Foundation\Http\FormRequest;

class StorePenggunaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username'     => ['required', 'string', 'max:100', 'unique:users,username'],
            'nama_lengkap' => ['required', 'string', 'max:150'],
            'password'     => ['required', 'string', 'min:6', 'max:255'],
            'jabatan_id'   => ['required', 'integer', 'exists:jabatan,id'],
            'gudang_id'    => ['nullable', 'integer', 'exists:gudangs,id'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required'     => 'Username wajib diisi.',
            'username.unique'       => 'Username sudah digunakan.',
            'username.max'          => 'Username maksimal 100 karakter.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'nama_lengkap.max'      => 'Nama lengkap maksimal 150 karakter.',
            'password.required'     => 'Password wajib diisi.',
            'password.min'          => 'Password minimal 6 karakter.',
            'jabatan_id.required'   => 'Jabatan wajib dipilih.',
            'jabatan_id.exists'     => 'Jabatan tidak valid.',
            'gudang_id.exists'      => 'Gudang tidak valid.',
        ];
    }
}
