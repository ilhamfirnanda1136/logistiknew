<?php

namespace App\Http\Controllers;

use App\Contracts\Services\GudangServiceInterface;
use App\Enums\JenisGudang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class GudangController extends Controller
{
    public function __construct(
        private readonly GudangServiceInterface $gudangService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('gudang/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->gudangService->paginate($request->only([
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_gudang'  => 'required|string|max:255',
            'jenis_gudang' => ['required', new Enum(JenisGudang::class)],
            'keterangan'   => 'nullable|string',
            'latitude'     => 'nullable|numeric|between:-90,90',
            'longitude'    => 'nullable|numeric|between:-180,180',
        ]);

        $this->gudangService->store($validated);

        return response()->json(['message' => 'Gudang berhasil ditambahkan.']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nama_gudang'  => 'required|string|max:255',
            'jenis_gudang' => ['required', new Enum(JenisGudang::class)],
            'keterangan'   => 'nullable|string',
            'latitude'     => 'nullable|numeric|between:-90,90',
            'longitude'    => 'nullable|numeric|between:-180,180',
        ]);

        $this->gudangService->update($id, $validated);

        return response()->json(['message' => 'Gudang berhasil diperbarui.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->gudangService->destroy($id);

        return response()->json(['message' => 'Gudang berhasil dihapus.']);
    }
}
