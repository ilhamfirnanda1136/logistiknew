<?php

namespace App\Http\Controllers;

use App\Contracts\Services\BarangKeluarServiceInterface;
use App\Http\Requests\BarangKeluar\StoreBarangKeluarRequest;
use App\Http\Requests\BarangKeluar\UpdateBarangKeluarRequest;
use App\Models\Barang;
use App\Models\Gudang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class BarangKeluarController extends Controller
{
    public function __construct(
        private readonly BarangKeluarServiceInterface $barangKeluarService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('barang-keluar/index', [
            'gudangList' => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang']),
            'barangList' => Barang::with(['dimensi:id,nama_dimensi', 'satuan:id,nama_satuan'])
                ->orderBy('nama_barang')
                ->get(['id', 'kode_barang', 'nama_barang', 'dimensi_id', 'satuan_id', 'stok']),
            'nextNoTransaksi' => $this->barangKeluarService->generateNoTransaksi(),
        ]);
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->barangKeluarService->paginate($request->only([
            'search',
            'sort_by',
            'sort_dir',
            'per_page',
            'page',
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

    public function store(StoreBarangKeluarRequest $request): JsonResponse
    {
        try {
            $this->barangKeluarService->store($request->validated());

            return response()->json(['message' => 'Barang keluar berhasil ditambahkan.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal menyimpan barang keluar.'], 500);
        }
    }

    public function update(UpdateBarangKeluarRequest $request, int $barangKeluar): JsonResponse
    {
        try {
            $this->barangKeluarService->update($barangKeluar, $request->validated());

            return response()->json(['message' => 'Barang keluar berhasil diperbarui.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal memperbarui barang keluar.'], 500);
        }
    }

    public function destroy(int $barangKeluar): JsonResponse
    {
        try {
            $this->barangKeluarService->destroy($barangKeluar);

            return response()->json(['message' => 'Barang keluar berhasil dihapus.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal menghapus barang keluar.'], 500);
        }
    }
}
