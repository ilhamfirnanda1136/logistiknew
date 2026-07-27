<?php

namespace App\Http\Controllers;

use App\Contracts\Services\KondisiServiceInterface;
use App\Http\Requests\Kondisi\StoreKondisiRequest;
use App\Http\Requests\Kondisi\UpdateKondisiRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KondisiController extends Controller
{
    public function __construct(
        private readonly KondisiServiceInterface $kondisiService,
    ) {}

    /**
     * Tampilkan halaman index Kondisi (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('kondisi/index');
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /kondisi/datatable?search=&sort_by=nama_kondisi&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->kondisiService->paginate($request->only([
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
     * Simpan kondisi baru.
     */
    public function store(StoreKondisiRequest $request): JsonResponse
    {
        $this->kondisiService->store($request->validated());

        return response()->json(['message' => 'Kondisi berhasil ditambahkan.']);
    }

    /**
     * Update kondisi.
     */
    public function update(UpdateKondisiRequest $request, int $kondisi): JsonResponse
    {
        $this->kondisiService->update($kondisi, $request->validated());

        return response()->json(['message' => 'Kondisi berhasil diperbarui.']);
    }

    /**
     * Hapus kondisi.
     */
    public function destroy(int $kondisi): JsonResponse
    {
        $this->kondisiService->destroy($kondisi);

        return response()->json(['message' => 'Kondisi berhasil dihapus.']);
    }
}
