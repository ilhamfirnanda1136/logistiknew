<?php

namespace App\Http\Requests\Barang;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_barang'  => ['required', 'string', 'max:50', 'unique:barangs,kode_barang'],
            'nama_barang'  => ['required', 'string', 'max:200'],
            'dimensi_id'   => ['nullable', 'integer', 'exists:dimensi,id'],
            'satuan_id'    => ['nullable', 'integer', 'exists:satuan,id'],
            'kategori_id'  => ['nullable', 'integer', 'exists:kategori,id'],
            'gudang_id'    => ['nullable', 'integer', 'exists:gudangs,id'],
            'stok'         => ['nullable', 'numeric', 'min:0'],
            'is_item_sr'   => ['nullable', 'boolean'],
            'keterangan'   => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_barang.required' => 'Kode barang wajib diisi.',
            'kode_barang.unique'   => 'Kode barang sudah digunakan.',
            'kode_barang.max'      => 'Kode barang maksimal 50 karakter.',
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'nama_barang.max'      => 'Nama barang maksimal 200 karakter.',
            'dimensi_id.exists'    => 'Dimensi tidak valid.',
            'satuan_id.exists'     => 'Satuan tidak valid.',
            'kategori_id.exists'   => 'Kategori tidak valid.',
            'gudang_id.exists'     => 'Gudang tidak valid.',
            'stok.numeric'         => 'Stok harus berupa angka.',
            'stok.min'             => 'Stok tidak boleh negatif.',
            'keterangan.max'       => 'Keterangan maksimal 1000 karakter.',
        ];
    }
}
