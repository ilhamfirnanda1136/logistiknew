<?php

namespace App\Http\Requests\Kadiv;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKadivRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $kadivId = $this->route('kadiv');

        return [
            'nama_kadiv' => [
                'required',
                'string',
                'max:150',
                Rule::unique('kadiv', 'nama_kadiv')->ignore($kadivId),
            ],
            'npp'          => ['nullable', 'string', 'max:50'],
            'keterangan'   => ['nullable', 'string', 'max:500'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_kadiv.required' => 'Nama kadiv wajib diisi.',
            'nama_kadiv.unique'   => 'Nama kadiv sudah digunakan.',
            'nama_kadiv.max'      => 'Nama kadiv maksimal 150 karakter.',
            'npp.max'             => 'NPP maksimal 50 karakter.',
            'keterangan.max'      => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
