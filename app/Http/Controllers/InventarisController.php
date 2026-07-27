<?php

namespace App\Http\Controllers;

use App\Contracts\Services\InventarisServiceInterface;
use App\Http\Requests\Inventaris\StoreInventarisRequest;
use App\Http\Requests\Inventaris\UpdateInventarisRequest;
use App\Models\Dimensi;
use App\Models\Gudang;
use App\Models\Kategori;
use App\Models\Kondisi;
use App\Models\Satuan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventarisController extends Controller
{
    public function __construct(
        private readonly InventarisServiceInterface $inventarisService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('inventaris/index', [
            'dimensiList'  => Dimensi::orderBy('nama_dimensi')->get(['id', 'nama_dimensi']),
            'satuanList'   => Satuan::orderBy('nama_satuan')->get(['id', 'nama_satuan']),
            'kategoriList' => Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']),
            'kondisiList'  => Kondisi::orderBy('nama_kondisi')->get(['id', 'nama_kondisi']),
            'gudangList'   => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang', 'jenis_gudang']),
        ]);
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->inventarisService->paginate($request->only([
            'search',
            'sort_by',
            'sort_dir',
            'per_page',
            'page',
            'gudang_id',
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

    public function store(StoreInventarisRequest $request): JsonResponse
    {
        $this->inventarisService->store($request->validated());

        return response()->json(['message' => 'Inventaris berhasil ditambahkan.']);
    }

    public function update(UpdateInventarisRequest $request, int $inventaris): JsonResponse
    {
        $this->inventarisService->update($inventaris, $request->validated());

        return response()->json(['message' => 'Inventaris berhasil diperbarui.']);
    }

    public function destroy(int $inventaris): JsonResponse
    {
        $this->inventarisService->destroy($inventaris);

        return response()->json(['message' => 'Inventaris berhasil dihapus.']);
    }
}
