<?php

namespace App\Http\Requests\Kendaraan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKendaraanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $kendaraanId = $this->route('kendaraan');

        return [
            'kode_kendaraan' => [
                'required',
                'string',
                'max:50',
                Rule::unique('kendaraan', 'kode_kendaraan')->ignore($kendaraanId),
            ],
            'nama_kendaraan'  => ['required', 'string', 'max:200'],
            'no_polisi'       => ['nullable', 'string', 'max:50'],
            'no_rangka'       => ['nullable', 'string', 'max:100'],
            'no_mesin'        => ['nullable', 'string', 'max:100'],
            'warna'           => ['nullable', 'string', 'max:50'],
            'jumlah'          => ['nullable', 'integer', 'min:0'],
            'tanggal_input'   => ['nullable', 'date'],
            'tahun_perolehan' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'harga_perolehan' => ['nullable', 'numeric', 'min:0'],
            'isi_silinder'    => ['nullable', 'string', 'max:50'],
            'masa_pakai'      => ['nullable', 'string', 'max:100'],
            'kondisi_id'      => ['nullable', 'integer', 'exists:kondisi,id'],
            'gudang_id'       => ['nullable', 'integer', 'exists:gudangs,id'],
            'kategori_id'     => ['nullable', 'integer', 'exists:kategori,id'],
            'keterangan'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_kendaraan.required' => 'Kode kendaraan wajib diisi.',
            'kode_kendaraan.unique'   => 'Kode kendaraan sudah digunakan.',
            'nama_kendaraan.required' => 'Nama kendaraan wajib diisi.',
            'kondisi_id.exists'       => 'Kondisi tidak valid.',
            'gudang_id.exists'        => 'Lokasi tidak valid.',
            'kategori_id.exists'      => 'Kategori tidak valid.',
        ];
    }
}
