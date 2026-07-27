<?php

namespace App\Http\Requests\Dimensi;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDimensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $dimensiId = $this->route('dimensi');

        return [
            'nama_dimensi' => [
                'required',
                'string',
                'max:100',
                Rule::unique('dimensi', 'nama_dimensi')->ignore($dimensiId),
            ],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_dimensi.required' => 'Nama dimensi wajib diisi.',
            'nama_dimensi.unique'   => 'Nama dimensi sudah digunakan.',
            'nama_dimensi.max'      => 'Nama dimensi maksimal 100 karakter.',
            'keterangan.max'        => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
