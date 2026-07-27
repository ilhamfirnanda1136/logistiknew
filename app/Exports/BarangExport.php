<?php

namespace App\Exports;

use App\Models\Barang;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BarangExport
{
    public function download(): StreamedResponse
    {
        $barangs = Barang::with(['dimensi', 'satuan', 'kategori', 'gudang'])
            ->orderBy('kode_barang')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Barang');

        // ── Header ────────────────────────────────────────────────────────────
        $headers = ['NO', 'KODE BARANG', 'NAMA BARANG', 'DIMENSI', 'SATUAN', 'LOKASI', 'KATEGORI', 'STOK', 'ITEM SR', 'KETERANGAN'];
        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        foreach ($headers as $i => $header) {
            $cell = $columns[$i] . '1';
            $sheet->setCellValue($cell, $header);
        }

        // Header style
        $headerStyle = [
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 11,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1D4ED8'],
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
        $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(22);

        // ── Data ──────────────────────────────────────────────────────────────
        foreach ($barangs as $index => $barang) {
            $row = $index + 2;
            $isEven = ($index % 2 === 0);
            $bgColor = $isEven ? 'F0F4FF' : 'FFFFFF';

            $sheet->setCellValue("A{$row}", $index + 1);
            $sheet->setCellValue("B{$row}", $barang->kode_barang);
            $sheet->setCellValue("C{$row}", $barang->nama_barang);
            $sheet->setCellValue("D{$row}", $barang->dimensi?->nama_dimensi ?? '-');
            $sheet->setCellValue("E{$row}", $barang->satuan?->nama_satuan ?? '-');
            $sheet->setCellValue("F{$row}", $barang->gudang?->nama_gudang ?? '-');
            $sheet->setCellValue("G{$row}", $barang->kategori?->nama_kategori ?? '-');
            $sheet->setCellValue("H{$row}", (float) $barang->stok);
            $sheet->setCellValue("I{$row}", $barang->is_item_sr ? 'Ya' : 'Tidak');
            $sheet->setCellValue("J{$row}", $barang->keterangan ?? '');

            $rowStyle = [
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $bgColor],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'D1D5DB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ];
            $sheet->getStyle("A{$row}:J{$row}")->applyFromArray($rowStyle);

            // Center number columns
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // ── Column widths ─────────────────────────────────────────────────────
        $widths = ['A' => 6, 'B' => 16, 'C' => 30, 'D' => 18, 'E' => 14, 'F' => 18, 'G' => 16, 'H' => 10, 'I' => 10, 'J' => 30];
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // ── Stream response ───────────────────────────────────────────────────
        $filename = 'data-barang-' . now()->format('Ymd-His') . '.xlsx';
        $writer   = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }
}
