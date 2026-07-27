<?php

namespace App\Http\Requests\Jabatan;

use App\Models\Jabatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJabatanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama_jabatan'  => ['required', 'string', 'max:100', 'unique:jabatan,nama_jabatan'],
            'level_akses'   => ['required', 'string', Rule::in(Jabatan::$levelAksesList)],
            'level_urutan'  => ['required', 'integer', 'min:1', 'max:99'],
            'keterangan'    => ['nullable', 'string', 'max:500'],
            'is_active'     => ['boolean'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama_jabatan.required'  => 'Nama jabatan wajib diisi.',
            'nama_jabatan.unique'    => 'Nama jabatan sudah digunakan.',
            'nama_jabatan.max'       => 'Nama jabatan maksimal 100 karakter.',
            'level_akses.required'   => 'Level akses wajib dipilih.',
            'level_akses.in'         => 'Level akses tidak valid.',
            'level_urutan.required'  => 'Level urutan wajib diisi.',
            'level_urutan.integer'   => 'Level urutan harus berupa angka.',
            'level_urutan.min'       => 'Level urutan minimal 1.',
            'level_urutan.max'       => 'Level urutan maksimal 99.',
            'keterangan.max'         => 'Keterangan maksimal 500 karakter.',
        ];
    }
}
