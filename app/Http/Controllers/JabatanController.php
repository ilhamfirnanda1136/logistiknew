<?php

namespace App\Http\Controllers;

use App\Contracts\Services\JabatanServiceInterface;
use App\Http\Requests\Jabatan\StoreJabatanRequest;
use App\Http\Requests\Jabatan\UpdateJabatanRequest;
use App\Models\Jabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JabatanController extends Controller
{
    public function __construct(
        private readonly JabatanServiceInterface $jabatanService,
    ) {}

    /**
     * Tampilkan halaman index Jabatan (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('jabatan/index', [
            'levelAksesList' => Jabatan::$levelAksesList,
            'levelLabels'    => Jabatan::$levelLabels,
        ]);
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /jabatan/datatable?search=&sort_by=level_urutan&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->jabatanService->paginate($request->only([
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
     * Simpan jabatan baru.
     */
    public function store(StoreJabatanRequest $request): JsonResponse
    {
        $this->jabatanService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Jabatan berhasil ditambahkan.']);
    }

    /**
     * Update jabatan.
     */
    public function update(UpdateJabatanRequest $request, int $jabatan): JsonResponse
    {
        $this->jabatanService->update($jabatan, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Jabatan berhasil diperbarui.']);
    }

    /**
     * Hapus jabatan.
     */
    public function destroy(int $jabatan): JsonResponse
    {
        $this->jabatanService->destroy($jabatan);

        return response()->json(['message' => 'Jabatan berhasil dihapus.']);
    }
}
