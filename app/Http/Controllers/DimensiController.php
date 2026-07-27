<?php

namespace App\Http\Controllers;

use App\Contracts\Services\DimensiServiceInterface;
use App\Http\Requests\Dimensi\StoreDimensiRequest;
use App\Http\Requests\Dimensi\UpdateDimensiRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DimensiController extends Controller
{
    public function __construct(
        private readonly DimensiServiceInterface $dimensiService,
    ) {}

    /**
     * Tampilkan halaman index Dimensi (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('dimensi/index');
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /dimensi/datatable?search=&sort_by=nama_dimensi&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->dimensiService->paginate($request->only([
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
     * Simpan dimensi baru.
     */
    public function store(StoreDimensiRequest $request): JsonResponse
    {
        $this->dimensiService->store($request->validated());

        return response()->json(['message' => 'Dimensi berhasil ditambahkan.']);
    }

    /**
     * Update dimensi.
     */
    public function update(UpdateDimensiRequest $request, int $dimensi): JsonResponse
    {
        $this->dimensiService->update($dimensi, $request->validated());

        return response()->json(['message' => 'Dimensi berhasil diperbarui.']);
    }

    /**
     * Hapus dimensi.
     */
    public function destroy(int $dimensi): JsonResponse
    {
        $this->dimensiService->destroy($dimensi);

        return response()->json(['message' => 'Dimensi berhasil dihapus.']);
    }
}
