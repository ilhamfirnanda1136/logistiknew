<?php

namespace App\Http\Requests\Kondisi;

use Illuminate\Foundation\Http\FormRequest;

class StoreKondisiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_kondisi' => ['required', 'string', 'max:100', 'unique:kondisi,nama_kondisi'],
            'keterangan'   => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kondisi.required' => 'Nama kondisi wajib diisi.',
            'nama_kondisi.unique'   => 'Nama kondisi sudah digunakan.',
            'nama_kondisi.max'      => 'Nama kondisi maksimal 100 karakter.',
            'keterangan.max'        => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
