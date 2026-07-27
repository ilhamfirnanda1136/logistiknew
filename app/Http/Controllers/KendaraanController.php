<?php

namespace App\Http\Controllers;

use App\Contracts\Services\KendaraanServiceInterface;
use App\Http\Requests\Kendaraan\StoreKendaraanRequest;
use App\Http\Requests\Kendaraan\UpdateKendaraanRequest;
use App\Models\Gudang;
use App\Models\Kategori;
use App\Models\Kondisi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KendaraanController extends Controller
{
    public function __construct(
        private readonly KendaraanServiceInterface $kendaraanService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('kendaraan/index', [
            'kondisiList'  => Kondisi::orderBy('nama_kondisi')->get(['id', 'nama_kondisi']),
            'gudangList'   => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang', 'jenis_gudang']),
            'kategoriList' => Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']),
        ]);
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->kendaraanService->paginate($request->only([
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

    public function store(StoreKendaraanRequest $request): JsonResponse
    {
        $this->kendaraanService->store($request->validated());

        return response()->json(['message' => 'Kendaraan berhasil ditambahkan.']);
    }

    public function update(UpdateKendaraanRequest $request, int $kendaraan): JsonResponse
    {
        $this->kendaraanService->update($kendaraan, $request->validated());

        return response()->json(['message' => 'Kendaraan berhasil diperbarui.']);
    }

    public function destroy(int $kendaraan): JsonResponse
    {
        $this->kendaraanService->destroy($kendaraan);

        return response()->json(['message' => 'Kendaraan berhasil dihapus.']);
    }
}
