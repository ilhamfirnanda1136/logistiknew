<?php

namespace App\Http\Controllers;

use App\Contracts\Services\BarangMasukServiceInterface;
use App\Http\Requests\BarangMasuk\StoreBarangMasukRequest;
use App\Http\Requests\BarangMasuk\UpdateBarangMasukRequest;
use App\Models\Barang;
use App\Models\Gudang;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class BarangMasukController extends Controller
{
    public function __construct(
        private readonly BarangMasukServiceInterface $barangMasukService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('barang-masuk/index', [
            'supplierList' => Supplier::orderBy('nama_supplier')->get(['id', 'nama_supplier']),
            'gudangList'   => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang']),
            'barangList'   => Barang::with(['dimensi:id,nama_dimensi', 'satuan:id,nama_satuan'])
                ->orderBy('nama_barang')
                ->get(['id', 'kode_barang', 'nama_barang', 'dimensi_id', 'satuan_id', 'stok']),
            'nextNoTransaksi' => $this->barangMasukService->generateNoTransaksi(),
        ]);
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->barangMasukService->paginate($request->only([
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

    public function store(StoreBarangMasukRequest $request): JsonResponse
    {
        try {
            $this->barangMasukService->store($request->validated());

            return response()->json(['message' => 'Barang masuk berhasil ditambahkan.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal menyimpan barang masuk.'], 500);
        }
    }

    public function update(UpdateBarangMasukRequest $request, int $barangMasuk): JsonResponse
    {
        try {
            $this->barangMasukService->update($barangMasuk, $request->validated());

            return response()->json(['message' => 'Barang masuk berhasil diperbarui.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal memperbarui barang masuk.'], 500);
        }
    }

    public function destroy(int $barangMasuk): JsonResponse
    {
        try {
            $this->barangMasukService->destroy($barangMasuk);

            return response()->json(['message' => 'Barang masuk berhasil dihapus.']);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal menghapus barang masuk.'], 500);
        }
    }
}
