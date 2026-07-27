<?php

namespace App\Http\Controllers;

use App\Contracts\Services\BarangServiceInterface;
use App\Exports\BarangExport;
use App\Exports\BarangTemplate;
use App\Http\Requests\Barang\StoreBarangRequest;
use App\Http\Requests\Barang\UpdateBarangRequest;
use App\Imports\BarangImport;
use App\Models\Dimensi;
use App\Models\Gudang;
use App\Models\Kategori;
use App\Models\Satuan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BarangController extends Controller
{
    public function __construct(
        private readonly BarangServiceInterface $barangService,
    ) {}

    /**
     * Tampilkan halaman index Barang (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('barang/index', [
            'dimensiList'  => Dimensi::orderBy('nama_dimensi')->get(['id', 'nama_dimensi']),
            'satuanList'   => Satuan::orderBy('nama_satuan')->get(['id', 'nama_satuan']),
            'kategoriList' => Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']),
            'gudangList'   => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang', 'jenis_gudang']),
        ]);
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /barang/datatable?search=&sort_by=kode_barang&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->barangService->paginate($request->only([
            'search',
            'sort_by',
            'sort_dir',
            'per_page',
            'page',
            'satuan_id',
            'kategori_id',
        ]));

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    /**
     * Simpan barang baru.
     */
    public function store(StoreBarangRequest $request): JsonResponse
    {
        $this->barangService->store(array_merge(
            $request->validated(),
            ['is_item_sr' => $request->boolean('is_item_sr', false)],
        ));

        return response()->json(['message' => 'Barang berhasil ditambahkan.']);
    }

    /**
     * Update barang.
     */
    public function update(UpdateBarangRequest $request, int $barang): JsonResponse
    {
        $this->barangService->update($barang, array_merge(
            $request->validated(),
            ['is_item_sr' => $request->boolean('is_item_sr', false)],
        ));

        return response()->json(['message' => 'Barang berhasil diperbarui.']);
    }

    /**
     * Hapus barang.
     */
    public function destroy(int $barang): JsonResponse
    {
        $this->barangService->destroy($barang);

        return response()->json(['message' => 'Barang berhasil dihapus.']);
    }

    /**
     * Export semua data barang ke Excel (dengan kolom stok).
     */
    public function exportExcel(): StreamedResponse
    {
        return (new BarangExport())->download();
    }

    /**
     * Import barang dari file Excel (tanpa kolom stok).
     */
    public function importExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ], [
            'file.required' => 'File Excel wajib dipilih.',
            'file.mimes'    => 'File harus berformat .xlsx, .xls, atau .csv.',
            'file.max'      => 'Ukuran file maksimal 5 MB.',
        ]);

        $result = (new BarangImport())->import($request->file('file'));

        $message = "Berhasil mengimpor {$result['success']} barang.";
        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} baris dilewati (kode duplikat).";
        }

        return response()->json([
            'message' => $message,
            'success' => $result['success'],
            'skipped' => $result['skipped'],
            'errors'  => $result['errors'],
        ]);
    }

    /**
     * Download template Excel kosong untuk keperluan import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        return (new BarangTemplate())->download();
    }
}
