<?php

namespace App\Imports;

use App\Models\Barang;
use App\Models\Dimensi;
use App\Models\Kategori;
use App\Models\Satuan;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Http\UploadedFile;

class BarangImport
{
    private array $errors  = [];
    private int   $success = 0;
    private int   $skipped = 0;

    /**
     * Proses import dari file Excel/CSV yang di-upload.
     */
    public function import(UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet       = $spreadsheet->getActiveSheet();
        $rows        = $sheet->toArray(null, true, true, true);

        // Lewati header (baris 1)
        foreach ($rows as $rowNum => $row) {
            if ($rowNum === 1) continue;

            // Ambil nilai kolom (A=NO, B=KODE, C=NAMA, D=DIMENSI, E=SATUAN, F=KATEGORI)
            $kodeBarang  = trim((string) ($row['B'] ?? ''));
            $namaBarang  = trim((string) ($row['C'] ?? ''));
            $namaDimensi = trim((string) ($row['D'] ?? ''));
            $namaSatuan  = trim((string) ($row['E'] ?? ''));
            $namaKategori = trim((string) ($row['F'] ?? ''));

            // Skip baris kosong
            if ($kodeBarang === '' && $namaBarang === '') {
                continue;
            }

            // Validasi wajib
            if ($kodeBarang === '') {
                $this->errors[] = "Baris {$rowNum}: Kode barang wajib diisi.";
                continue;
            }
            if ($namaBarang === '') {
                $this->errors[] = "Baris {$rowNum}: Nama barang wajib diisi.";
                continue;
            }
            if (mb_strlen($kodeBarang) > 50) {
                $this->errors[] = "Baris {$rowNum}: Kode barang '{$kodeBarang}' melebihi 50 karakter.";
                continue;
            }

            // Cek duplikat kode di DB
            if (Barang::where('kode_barang', $kodeBarang)->exists()) {
                $this->errors[] = "Baris {$rowNum}: Kode '{$kodeBarang}' sudah ada, dilewati.";
                $this->skipped++;
                continue;
            }

            // Lookup relasi by nama
            $dimensiId  = $namaDimensi  ? Dimensi::where('nama_dimensi', $namaDimensi)->value('id')    : null;
            $satuanId   = $namaSatuan   ? Satuan::where('nama_satuan', $namaSatuan)->value('id')        : null;
            $kategoriId = $namaKategori ? Kategori::where('nama_kategori', $namaKategori)->value('id')  : null;

            // Warning jika nama tidak ditemukan
            if ($namaDimensi && ! $dimensiId) {
                $this->errors[] = "Baris {$rowNum}: Dimensi '{$namaDimensi}' tidak ditemukan, dikosongkan.";
            }
            if ($namaSatuan && ! $satuanId) {
                $this->errors[] = "Baris {$rowNum}: Satuan '{$namaSatuan}' tidak ditemukan, dikosongkan.";
            }
            if ($namaKategori && ! $kategoriId) {
                $this->errors[] = "Baris {$rowNum}: Kategori '{$namaKategori}' tidak ditemukan, dikosongkan.";
            }

            try {
                Barang::create([
                    'kode_barang'  => $kodeBarang,
                    'nama_barang'  => $namaBarang,
                    'dimensi_id'   => $dimensiId,
                    'satuan_id'    => $satuanId,
                    'kategori_id'  => $kategoriId,
                    'gudang_id'    => null,
                    'stok'         => 0,
                    'is_item_sr'   => false,
                    'keterangan'   => null,
                ]);
                $this->success++;
            } catch (\Exception $e) {
                $this->errors[] = "Baris {$rowNum}: Gagal menyimpan '{$kodeBarang}' – " . $e->getMessage();
            }
        }

        return [
            'success' => $this->success,
            'skipped' => $this->skipped,
            'errors'  => $this->errors,
        ];
    }
}
