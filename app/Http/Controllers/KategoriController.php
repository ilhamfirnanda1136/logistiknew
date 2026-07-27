<?php

namespace App\Http\Controllers;

use App\Contracts\Services\KategoriServiceInterface;
use App\Http\Requests\Kategori\StoreKategoriRequest;
use App\Http\Requests\Kategori\UpdateKategoriRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KategoriController extends Controller
{
    public function __construct(
        private readonly KategoriServiceInterface $kategoriService,
    ) {}

    /**
     * Tampilkan halaman index Kategori (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('kategori/index');
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /kategori/datatable?search=&sort_by=nama_kategori&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->kategoriService->paginate($request->only([
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

    /**
     * Simpan kategori baru.
     */
    public function store(StoreKategoriRequest $request): JsonResponse
    {
        $this->kategoriService->store($request->validated());

        return response()->json(['message' => 'Kategori berhasil ditambahkan.']);
    }

    /**
     * Update kategori.
     */
    public function update(UpdateKategoriRequest $request, int $kategori): JsonResponse
    {
        $this->kategoriService->update($kategori, $request->validated());

        return response()->json(['message' => 'Kategori berhasil diperbarui.']);
    }

    /**
     * Hapus kategori.
     */
    public function destroy(int $kategori): JsonResponse
    {
        $this->kategoriService->destroy($kategori);

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
