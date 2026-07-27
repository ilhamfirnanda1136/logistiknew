<?php

namespace App\Http\Controllers;

use App\Contracts\Services\PenggunaServiceInterface;
use App\Http\Requests\Pengguna\StorePenggunaRequest;
use App\Http\Requests\Pengguna\UpdatePenggunaRequest;
use App\Models\Gudang;
use App\Models\Jabatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    public function __construct(
        private readonly PenggunaServiceInterface $penggunaService,
    ) {}

    /**
     * Tampilkan halaman index Pengguna (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('pengguna/index', [
            'jabatanList' => Jabatan::orderBy('level_urutan')->get(['id', 'nama_jabatan', 'level_akses']),
            'gudangList'  => Gudang::orderBy('nama_gudang')->get(['id', 'nama_gudang', 'jenis_gudang']),
        ]);
    }

    /**
     * Endpoint JSON untuk DataTable serverside.
     *
     * GET /pengguna/datatable?search=&sort_by=nama_lengkap&sort_dir=asc&per_page=10&page=1
     */
    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->penggunaService->paginate($request->only([
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
     * Simpan pengguna baru.
     */
    public function store(StorePenggunaRequest $request): JsonResponse
    {
        $this->penggunaService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Pengguna berhasil ditambahkan.']);
    }

    /**
     * Update pengguna.
     */
    public function update(UpdatePenggunaRequest $request, int $pengguna): JsonResponse
    {
        $this->penggunaService->update($pengguna, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Pengguna berhasil diperbarui.']);
    }

    /**
     * Hapus pengguna.
     */
    public function destroy(int $pengguna): JsonResponse
    {
        $this->penggunaService->destroy($pengguna);

        return response()->json(['message' => 'Pengguna berhasil dihapus.']);
    }
}
