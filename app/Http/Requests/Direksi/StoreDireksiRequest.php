<?php

namespace App\Http\Requests\Direksi;

use Illuminate\Foundation\Http\FormRequest;

class StoreDireksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_direksi' => ['required', 'string', 'max:150', 'unique:direksi,nama_direksi'],
            'keterangan'   => ['nullable', 'string', 'max:500'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_direksi.required' => 'Nama direksi wajib diisi.',
            'nama_direksi.unique'   => 'Nama direksi sudah digunakan.',
            'nama_direksi.max'      => 'Nama direksi maksimal 150 karakter.',
            'keterangan.max'        => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
