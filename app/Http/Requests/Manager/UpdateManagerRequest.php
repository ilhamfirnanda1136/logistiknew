<?php

namespace App\Http\Requests\Manager;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $managerId = $this->route('manager');

        return [
            'nama_manager' => [
                'required',
                'string',
                'max:150',
                Rule::unique('manager', 'nama_manager')->ignore($managerId),
            ],
            'npp'          => ['nullable', 'string', 'max:50'],
            'keterangan'   => ['nullable', 'string', 'max:500'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_manager.required' => 'Nama manager wajib diisi.',
            'nama_manager.unique'   => 'Nama manager sudah digunakan.',
            'nama_manager.max'      => 'Nama manager maksimal 150 karakter.',
            'npp.max'               => 'NPP maksimal 50 karakter.',
            'keterangan.max'        => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
