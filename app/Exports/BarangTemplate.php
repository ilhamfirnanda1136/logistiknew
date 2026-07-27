<?php

namespace App\Exports;

use App\Models\Barang;
use App\Models\Dimensi;
use App\Models\Kategori;
use App\Models\Satuan;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BarangTemplate
{
    /**
     * Pool contoh nama barang untuk isi template.
     *
     * @var list<array{nama: string, prefix: string}>
     */
    private const SAMPLE_POOL = [
        ['nama' => 'Air Valve', 'prefix' => 'AV'],
        ['nama' => 'HVS Folio', 'prefix' => 'HVS'],
        ['nama' => 'Ball Valve', 'prefix' => 'BV'],
        ['nama' => 'Pipa PVC', 'prefix' => 'PVC'],
        ['nama' => 'Seal Tape', 'prefix' => 'ST'],
        ['nama' => 'Elbow Galvanis', 'prefix' => 'EG'],
        ['nama' => 'Kabel NYA', 'prefix' => 'NYA'],
        ['nama' => 'Fitting Brass', 'prefix' => 'FB'],
        ['nama' => 'Stop Kran', 'prefix' => 'SK'],
        ['nama' => 'Meteran Air', 'prefix' => 'MA'],
    ];

    public function download(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Barang');

        // ── Header ────────────────────────────────────────────────────────────
        $headers = ['NO', 'KODE BARANG', 'NAMA BARANG', 'DIMENSI', 'SATUAN', 'KATEGORI'];
        $columns = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach ($headers as $i => $header) {
            $sheet->setCellValue($columns[$i].'1', $header);
        }

        // Header style – oranye sesuai tombol Template
        $headerStyle = [
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 11,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D97706'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'FFFFFF'],
                ],
            ],
        ];
        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(22);

        // ── Sample data (5 baris, kode unik vs DB) ─────────────────────────────
        $samples = $this->buildSampleRows(5);

        foreach ($samples as $index => $sample) {
            $row = $index + 2;

            $sheet->setCellValue("A{$row}", $index + 1);
            $sheet->setCellValue("B{$row}", $sample['kode_barang']);
            $sheet->setCellValue("C{$row}", $sample['nama_barang']);
            $sheet->setCellValue("D{$row}", $sample['dimensi']);
            $sheet->setCellValue("E{$row}", $sample['satuan']);
            $sheet->setCellValue("F{$row}", $sample['kategori']);

            $style = [
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => ($row % 2 === 0) ? 'FFF7ED' : 'FFFFFF'],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'E5E7EB'],
                    ],
                ],
            ];
            $sheet->getStyle("A{$row}:F{$row}")->applyFromArray($style);
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // Baris kosong tambahan (opsional diisi user)
        for ($row = count($samples) + 2; $row <= 20; $row++) {
            $sheet->setCellValue("A{$row}", $row - 1);

            $style = [
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => ($row % 2 === 0) ? 'FFF7ED' : 'FFFFFF'],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'E5E7EB'],
                    ],
                ],
            ];
            $sheet->getStyle("A{$row}:F{$row}")->applyFromArray($style);
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // ── Column widths ─────────────────────────────────────────────────────
        $widths = ['A' => 6, 'B' => 18, 'C' => 32, 'D' => 18, 'E' => 14, 'F' => 18];
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // ── Notes sheet ───────────────────────────────────────────────────────
        $noteSheet = $spreadsheet->createSheet();
        $noteSheet->setTitle('Petunjuk');
        $noteSheet->setCellValue('A1', 'PETUNJUK PENGISIAN');
        $noteSheet->setCellValue('A3', '1. Kolom NO diisi otomatis, tidak perlu diubah.');
        $noteSheet->setCellValue('A4', '2. KODE BARANG harus unik (tidak boleh duplikat).');
        $noteSheet->setCellValue('A5', '3. NAMA BARANG wajib diisi.');
        $noteSheet->setCellValue('A6', '4. DIMENSI, SATUAN, KATEGORI diisi sesuai nama yang sudah ada di sistem (boleh kosong).');
        $noteSheet->setCellValue('A7', '5. Template sudah berisi 5 contoh data dengan kode yang belum ada di database.');
        $noteSheet->setCellValue('A8', '6. Hapus / ubah baris contoh sesuai kebutuhan sebelum import.');
        $noteSheet->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $noteSheet->getColumnDimension('A')->setWidth(80);

        $spreadsheet->setActiveSheetIndex(0);

        // ── Stream response ───────────────────────────────────────────────────
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template-import-barang.xlsx"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    /**
     * Bangun N baris contoh. Setiap kode dicek ke DB; jika sudah ada, diganti kode lain.
     *
     * @return list<array{kode_barang: string, nama_barang: string, dimensi: string, satuan: string, kategori: string}>
     */
    private function buildSampleRows(int $count = 5): array
    {
        $dimensiNames = Dimensi::orderBy('nama_dimensi')->pluck('nama_dimensi')->all();
        $satuanNames = Satuan::orderBy('nama_satuan')->pluck('nama_satuan')->all();
        $kategoriNames = Kategori::orderBy('nama_kategori')->pluck('nama_kategori')->all();

        $usedCodes = Barang::pluck('kode_barang')->map(fn ($k) => strtoupper((string) $k))->all();
        $usedInTemplate = [];

        $pool = self::SAMPLE_POOL;
        shuffle($pool);

        $rows = [];
        $i = 0;

        while (count($rows) < $count) {
            $sample = $pool[$i % count($pool)];
            $i++;

            $kode = $this->uniqueKode($sample['prefix'], $usedCodes, $usedInTemplate);
            $usedInTemplate[] = strtoupper($kode);

            $rows[] = [
                'kode_barang' => $kode,
                'nama_barang' => $sample['nama'],
                'dimensi'     => $dimensiNames[count($rows) % max(count($dimensiNames), 1)] ?? '',
                'satuan'      => $satuanNames[count($rows) % max(count($satuanNames), 1)] ?? '',
                'kategori'    => $kategoriNames[count($rows) % max(count($kategoriNames), 1)] ?? '',
            ];
        }

        return $rows;
    }

    /**
     * Generate kode unik: PREFIX-001, PREFIX-002, ... lalu fallback random jika bentrok.
     *
     * @param  list<string>  $existingDbCodes  uppercase
     * @param  list<string>  $usedInTemplate   uppercase
     */
    private function uniqueKode(string $prefix, array $existingDbCodes, array $usedInTemplate): string
    {
        $prefix = strtoupper($prefix);

        for ($n = 1; $n <= 999; $n++) {
            $kode = sprintf('%s-%03d', $prefix, $n);
            $upper = strtoupper($kode);

            if (! in_array($upper, $existingDbCodes, true) && ! in_array($upper, $usedInTemplate, true)) {
                return $kode;
            }
        }

        // Fallback jika semua sequence terpakai
        do {
            $kode = sprintf('%s-%s', $prefix, strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)));
            $upper = strtoupper($kode);
        } while (in_array($upper, $existingDbCodes, true) || in_array($upper, $usedInTemplate, true));

        return $kode;
    }
}
