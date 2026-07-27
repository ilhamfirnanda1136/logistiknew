<?php

namespace App\Http\Requests\Satuan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSatuanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $satuanId = $this->route('satuan');

        return [
            'nama_satuan' => [
                'required',
                'string',
                'max:100',
                Rule::unique('satuan', 'nama_satuan')->ignore($satuanId),
            ],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_satuan.required' => 'Nama satuan wajib diisi.',
            'nama_satuan.unique'   => 'Nama satuan sudah digunakan.',
            'nama_satuan.max'      => 'Nama satuan maksimal 100 karakter.',
            'keterangan.max'       => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
