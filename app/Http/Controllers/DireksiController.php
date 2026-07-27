<?php

namespace App\Http\Controllers;

use App\Contracts\Services\DireksiServiceInterface;
use App\Http\Requests\Direksi\StoreDireksiRequest;
use App\Http\Requests\Direksi\UpdateDireksiRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DireksiController extends Controller
{
    public function __construct(
        private readonly DireksiServiceInterface $direksiService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('direksi/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $paginator = $this->direksiService->paginate($request->only([
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

    public function store(StoreDireksiRequest $request): JsonResponse
    {
        $this->direksiService->store(array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Direksi berhasil ditambahkan.']);
    }

    public function update(UpdateDireksiRequest $request, int $direksi): JsonResponse
    {
        $this->direksiService->update($direksi, array_merge(
            $request->validated(),
            ['is_active' => $request->boolean('is_active', true)],
        ));

        return response()->json(['message' => 'Direksi berhasil diperbarui.']);
    }

    public function destroy(int $direksi): JsonResponse
    {
        $this->direksiService->destroy($direksi);

        return response()->json(['message' => 'Direksi berhasil dihapus.']);
    }
}
