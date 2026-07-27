<?php

namespace App\Http\Requests\Kondisi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKondisiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $kondisiId = $this->route('kondisi');

        return [
            'nama_kondisi' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kondisi', 'nama_kondisi')->ignore($kondisiId),
            ],
            'keterangan' => ['nullable', 'string', 'max:500'],
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
