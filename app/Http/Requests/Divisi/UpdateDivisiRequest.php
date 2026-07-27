<?php

namespace App\Http\Requests\Divisi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDivisiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $divisiId = $this->route('divisi');

        return [
            'nama_divisi' => [
                'required',
                'string',
                'max:100',
                Rule::unique('divisi', 'nama_divisi')->ignore($divisiId),
            ],
            'keterangan' => ['nullable', 'string', 'max:500'],
            'is_active'  => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama_divisi.required' => 'Nama divisi wajib diisi.',
            'nama_divisi.unique'   => 'Nama divisi sudah digunakan.',
            'nama_divisi.max'      => 'Nama divisi maksimal 100 karakter.',
            'keterangan.max'       => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
