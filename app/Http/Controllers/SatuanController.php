<?php

namespace App\Http\Controllers;

use App\Contracts\Services\SatuanServiceInterface;
use App\Http\Requests\Satuan\StoreSatuanRequest;
use App\Http\Requests\Satuan\UpdateSatuanRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SatuanController extends Controller
{
    public function __construct(
        private readonly SatuanServiceInterface $satuanService,
    ) {}

    /**
     * Tampilkan halaman index Satuan (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('satuan/index');
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /satuan/datatable?search=&sort_by=nama_satuan&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->satuanService->paginate($request->only([
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
     * Simpan satuan baru.
     */
    public function store(StoreSatuanRequest $request): JsonResponse
    {
        $this->satuanService->store($request->validated());

        return response()->json(['message' => 'Satuan berhasil ditambahkan.']);
    }

    /**
     * Update satuan.
     */
    public function update(UpdateSatuanRequest $request, int $satuan): JsonResponse
    {
        $this->satuanService->update($satuan, $request->validated());

        return response()->json(['message' => 'Satuan berhasil diperbarui.']);
    }

    /**
     * Hapus satuan.
     */
    public function destroy(int $satuan): JsonResponse
    {
        $this->satuanService->destroy($satuan);

        return response()->json(['message' => 'Satuan berhasil dihapus.']);
    }
}
