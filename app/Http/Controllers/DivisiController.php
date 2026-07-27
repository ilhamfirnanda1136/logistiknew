<?php

namespace App\Http\Controllers;

use App\Contracts\Services\DivisiServiceInterface;
use App\Http\Requests\Divisi\StoreDivisiRequest;
use App\Http\Requests\Divisi\UpdateDivisiRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DivisiController extends Controller
{
    public function __construct(
        private readonly DivisiServiceInterface $divisiService,
    ) {}

    /**
     * Tampilkan halaman index Divisi (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('divisi/index');
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /divisi/datatable?search=&sort_by=id&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->divisiService->paginate($request->only([
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
     * Simpan divisi baru.
     */
    public function store(StoreDivisiRequest $request): JsonResponse
    {
        $this->divisiService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Divisi berhasil ditambahkan.']);
    }

    /**
     * Update divisi.
     */
    public function update(UpdateDivisiRequest $request, int $divisi): JsonResponse
    {
        $this->divisiService->update($divisi, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Divisi berhasil diperbarui.']);
    }

    /**
     * Hapus divisi.
     */
    public function destroy(int $divisi): JsonResponse
    {
        $this->divisiService->destroy($divisi);

        return response()->json(['message' => 'Divisi berhasil dihapus.']);
    }
}
