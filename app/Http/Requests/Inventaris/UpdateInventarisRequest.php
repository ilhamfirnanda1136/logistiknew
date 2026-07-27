<?php

namespace App\Http\Requests\Inventaris;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventarisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $inventarisId = $this->route('inventaris');

        return [
            'kode_barang' => [
                'required',
                'string',
                'max:50',
                Rule::unique('inventaris', 'kode_barang')->ignore($inventarisId),
            ],
            'tanggal_input'     => ['nullable', 'date'],
            'tanggal_perolehan' => ['nullable', 'date'],
            'no_inventaris'     => ['nullable', 'string', 'max:100'],
            'nama_inventaris'   => ['required', 'string', 'max:200'],
            'merek'             => ['nullable', 'string', 'max:100'],
            'jumlah'            => ['nullable', 'integer', 'min:0'],
            'dimensi_id'        => ['nullable', 'integer', 'exists:dimensi,id'],
            'satuan_id'         => ['nullable', 'integer', 'exists:satuan,id'],
            'kategori_id'       => ['nullable', 'integer', 'exists:kategori,id'],
            'kondisi_id'        => ['nullable', 'integer', 'exists:kondisi,id'],
            'gudang_id'         => ['nullable', 'integer', 'exists:gudangs,id'],
            'keterangan'        => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_barang.required'     => 'Kode barang wajib diisi.',
            'kode_barang.unique'       => 'Kode barang sudah digunakan.',
            'nama_inventaris.required' => 'Nama inventaris wajib diisi.',
            'jumlah.integer'           => 'Jumlah harus berupa angka.',
            'jumlah.min'               => 'Jumlah tidak boleh negatif.',
            'dimensi_id.exists'        => 'Dimensi tidak valid.',
            'satuan_id.exists'         => 'Satuan tidak valid.',
            'kategori_id.exists'       => 'Kategori tidak valid.',
            'kondisi_id.exists'        => 'Kondisi tidak valid.',
            'gudang_id.exists'         => 'Lokasi tidak valid.',
        ];
    }
}
