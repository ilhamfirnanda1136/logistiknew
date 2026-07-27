<?php

namespace App\Http\Requests\BarangKeluar;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarangKeluarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal'           => ['required', 'date'],
            'gudang_id'         => ['nullable', 'integer', 'exists:gudangs,id'],
            'keterangan'        => ['nullable', 'string', 'max:1000'],
            'items'             => ['required', 'array', 'min:1'],
            'items.*.barang_id' => ['required', 'integer', 'exists:barangs,id', 'distinct'],
            'items.*.jumlah'    => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal.required'           => 'Tanggal wajib diisi.',
            'gudang_id.exists'           => 'Lokasi tidak valid.',
            'items.required'             => 'Minimal satu barang harus ditambahkan.',
            'items.min'                  => 'Minimal satu barang harus ditambahkan.',
            'items.*.barang_id.required' => 'Barang wajib dipilih.',
            'items.*.barang_id.exists'   => 'Barang tidak valid.',
            'items.*.barang_id.distinct' => 'Barang tidak boleh duplikat dalam satu transaksi.',
            'items.*.jumlah.required'    => 'Jumlah wajib diisi.',
            'items.*.jumlah.min'         => 'Jumlah minimal 0.01.',
        ];
    }
}
